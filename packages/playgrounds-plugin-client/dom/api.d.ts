/** Scalars allowed as children in a component tree. */
type UnaryChild = string | ComponentTree;

/** Scalars allowed as children in a component tree. */
type Child = UnaryChild | UnaryChild[];

interface AnyProps {
  /** Special property defining the tree. */
  children?: Child[];
  [key: string]: any;
}

/** A serializable representation of a dom element. */
interface ElementTree {
  tag: string;
  attributes?: object;
  children?: readonly (string | ElementTree)[];
}

/** A function that maps a dictionary into a component tree. */
interface Component<P extends AnyProps = {}> {
  (props: P): null | ComponentTree;
}

/** A heterogenous tree of realized elements and unrealized components. */
interface ComponentTree {
  Component: string | Component;
  props: AnyProps;
}
