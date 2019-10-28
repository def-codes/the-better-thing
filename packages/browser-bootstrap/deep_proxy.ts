/**
 *  Provides a method for creating a “deep” proxy of an object.  The proxy
 *  creates in effect a namespace with extremely late binding.
 *
 *  Note that because this module is used for hot reloading, it must be
 *  explicitly exempted from hot reloading, along with any of its (transitive)
 *  imports.
 */
import { is_instance_of_builtin } from "./is_builtin";

/*
 *  Support per-member opt-out of proxying.  This may be wanted in cases where
 *  proxying breaks certain expectations that are more important than hot
 *  loading.  The only case I've found so far is where a module creates values
 *  using a constructor that it exports, and later a client module does
 *  reference tests against that constructor (including `instanceof`).  The
 *  tests will fail, because the exported constructor does not maintain
 *  reference identity with the object that was used from inside the module.
 */
const NO_PROXY = Symbol.for("@@proxy/no");

/**
 *  This method creates a proxy that is unusual in two ways:
 *
 *  1. The target's members are also proxied.  This is important if you want to
 *     make sure the proxy is still involved even when, e.g. clients retain a
 *     reference to a member.
 *
 *  2. The target is not provided directly but “thunked.”  This means that you
 *     can effectively change the target after the fact.  Indeed, since the
 *     traps are otherwise just forwarding, that's about all you *can* do with
 *     this.
 *
 *  An additional measure is taken to ensure that “classes” are also proxied as
 *  intended, *viz*, to include the prototypes of new objects.
 *
 *  ## React classes
 *
 *  This proxy works and supports hotreload for `React.createClass` components,
 *  although you get the warning about “Something is calling a React component
 *  directly.”  As of React version 16, `createClass` is deprecated, anyway.
 *
 *  ## Built-in objects
 *
 *  Currently, the proxy's “contagion” into its members will be bypassed for any
 *  object that it thinks is a “built-in” object, i.e. one whose prototype is
 *  defined by the host.  There's no rule against proxing such objects *per se*,
 *  and it will work transparently in some cases.  But certain prototypes have
 *  special invariants that effectively prevent it.
 *
 *  So far, I only know of one case, but it covers many---if not most---common
 *  objects in the browser.  If you try to proxy an `EventTarget`, you'll run
 *  into this message from Firefox:
 *
 *      TypeError: 'addEventListener' called on an object that does not
 *      implement interface EventTarget
 *
 *  while Chrome just gives “Illegal invocation”.  The problem is that, while
 *  the proxy is generally transparent, the runtime knows that the “actual”
 *  target is not in fact the original.
 *
 *  If necessary, I'll add a bypass flag if you want to do this anyway.
 *
 *  See the {@link is_instance_of_builtin} for the heuristic used to determine
 *  nativeness.
 *
 *  ## Limits on changing target
 *
 *  The current implementation allows you to change the target of a proxy by
 *  indirection.  However, all `Proxy` instances are originally based on an
 *  existing value, and since `Proxy` itself doesn't allow you to change its
 *  target, the original value remains the target of the proxy.  This doesn't
 *  matter in most cases, since the traps are all dispatched to the provided
 *  handlers.  However, `Proxy` does attempt to maintain some invariants, one of
 *  which is that a proxied object cannot suddenly be treated like a function,
 *  and *vice versa*.
 *
 *  Functions are objects and can be treated as objects in most ways.  But if
 *  you change the proxy target from an object to a function, you'll get
 *  something like:
 *
 *      fn.apply is not a function
 *
 *  I don't know a workaround for this without reload.  As with the other issues
 *  here, once the proxy is out, it's out.
 *
 *  `Proxy` also tries to maintain certain invariants regarding property
 *  configuration.  See notes in the code.
 *
 *  ## Reference issue
 *
 *  One problem that arises with the current implementation is when members of a
 *  proxied object contain pre-proxy references to other members.  Although the
 *  proxy itself may operate normally, the problem arises when you compare
 *  references from "both sides" of the proxy.  The same object will have
 *  different reference identity when referenced from inside and outside of the
 *  module.  See the `hot.no-proxy` definition above.
 *
 *  @param get_target - A thunk for the object being proxied
 */
export function deep_proxy(get_target?: () => any, general_traps = Reflect) {
  // Support redefinable proxy.
  let __internal_target;
  if (get_target === undefined) {
    __internal_target = Object.create(null);
    // TS: Need type asserts on `get_target()` below because CFA doesn't capture
    // this.  Related: https://github.com/Microsoft/TypeScript/pull/10357
    get_target = () => __internal_target;
  }

  const cache = Object.create(null);

  const special_traps = {
    /**
     *  Extend proxying into the prototypes of constructed objects.  If you're
     *  proxying a constructor, your intention is probably to proxy the entire
     *  “class,” meaning that the prototype of new objects will also be proxied
     *  (not just the body of the constructor function).  Depending on what
     *  method of classmaking you use, this may or may not be covered by the
     *  default traps.
     *
     *  After an object is created with the `new` keyword, its prototype will be
     *  set to the `prototype` property of the constructor function.  And since
     *  this constructor function is proxied, accessing its `prototype` property
     *  will fall into the `get` trap below, which will return a proxied object
     *  whenever possible.
     *
     *  But the constructor's `prototype` property is defined as [non-writable
     *  and non-configurable by
     *  default](http://www.ecma-international.org/ecma-262/6.0/#sec-function-instances-prototype),
     *  and will stay that way ([unless you screw it
     *  up](http://webreflection.blogspot.com/2014/03/what-books-didnt-tell-you-about-es5.html)).
     *  Since proxying is bypassed for such properties, the returned prototype
     *  will still be “cold.”  We salvage those cases here by explicitly
     *  proxying and setting the prototype.
     */
    construct(target, argList, newTarget) {
      const new_object = Reflect.construct(get_target!(), argList, newTarget);
      // const new_object = new (get_target())(...argumentsList);

      if (Object.getPrototypeOf(new_object) === target.prototype) {
        const prototype_proxy =
          cache.prototype ||
          (cache.prototype = deep_proxy(
            () => get_target!().prototype,
            general_traps
          ));

        Object.setPrototypeOf(new_object, prototype_proxy);
      }

      return new_object;
    },

    get(target, key) {
      /**
       *  Proxy will throw a type error if you don't exempt these.  You can't
       *  get around it by setting the target as an empty object (while
       *  dispatching everything else to the "real" target), because
       *
       *      TypeError: proxy can't report a non-existent property as
       *      non-configurable
       *
       *  In fact, those points are the reason why the proxy needs to target the
       *  “real” object (i.e. the older value) at all.  This would become a
       *  problem if the new object's structure got too out of sync with it.
       */
      const property = Object.getOwnPropertyDescriptor(target, key);
      // ALSO do this for Symbols?  If original value was a Symbol (and not from
      // registry), then value in new target won't match identity, which is
      // pretty much the only function of symbols.
      if (property && !property.writable && !property.configurable)
        return target[key];

      const cold_value = get_target!()[key];
      if (cold_value !== null) {
        const cold_type = typeof cold_value;
        if (cold_type === "object" || cold_type === "function") {
          // Huh? what about falsy values?
          // shouldn't this be
          //if (key in cache) return cache[key];
          const cached = cache[key];
          if (cached) return cached;

          // You can't change your mind in-flight about whether something should
          // be proxied.  Either way, you'll (probably) have leaked references
          // to the proxied or unproxied value, and you'll get unexpected
          // results.  (So, this might as well be done after the cache check.)
          if (cold_value[NO_PROXY]) return target[key];

          // See documentation.
          if (!Array.isArray(cold_value) && is_instance_of_builtin(cold_value))
            return target[key];

          // If you call `toString` on a proxied function, you'll get a
          // TypeError:
          //
          //     Function.prototype.toString called on incompatible object
          //
          // That may have been what the founders intended, but it's not useful.
          // This works around it.  See
          // https://bugzilla.mozilla.org/show_bug.cgi?id=1140854
          if (key === "toString" && typeof target === "function")
            return (cache.toString = () => get_target!().toString());

          return (cache[key] = deep_proxy(
            () => get_target!()[key],
            general_traps
          ));
        }
      }

      return cold_value;
    },
    set(invocation_target, key, value, receiver) {
      if (__internal_target) return (__internal_target[key] = value), true;
      return Reflect.set(invocation_target, key, value, receiver);
    },
  };

  // `Proxy` naturally has a static target.  In order to support truly late
  // binding, you have to intercept every trap to make sure that it dispatches
  // to the latest target.  One convenient way to do that is with another Proxy,
  // although this is presumably slower than the equivalent concrete object.
  const handler = new Proxy(
    {},
    {
      get: (_target, trap) =>
        special_traps[trap] ||
        ((_tgt, ...args) => general_traps[trap](get_target!(), ...args)),
    }
  );

  return new Proxy(get_target(), handler);
}
