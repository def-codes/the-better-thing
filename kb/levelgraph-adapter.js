// ADAPTED from example code in the `sparql-engine` repo
const { BindingBase, Graph, Pipeline } = require("sparql-engine");

module.exports.LevelRDFGraph = class LevelRDFGraph extends Graph {
  constructor(db) {
    super();
    this._db = db;
  }

  evalBGP(bgp) {
    // Connect the Node.js Readable stream
    // into the SPARQL query engine using the fromAsync method
    return Pipeline.getInstance().fromAsync(input => {
      // rewrite variables using levelgraph API
      bgp = bgp.map(t => {
        if (t.subject.startsWith("?")) {
          t.subject = this._db.v(t.subject.substring(1));
        }
        if (t.predicate.startsWith("?")) {
          t.predicate = this._db.v(t.predicate.substring(1));
        }
        if (t.object.startsWith("?")) {
          t.object = this._db.v(t.object.substring(1));
        }
        return t;
      });
      // Evaluates the BGP using Levelgraph stream API
      const stream = this._db.searchStream(bgp);

      // pipe results & errors into the query engine
      stream.on("error", err => input.error(err));
      stream.on("end", () => input.complete());
      // convert Levelgraph solutions into Bindings objects (the format used by sparql-engine)
      stream.on("data", results => input.next(BindingBase.fromObject(results)));
    });
  }

  insert(triple) {
    return new Promise((resolve, reject) => {
      this._db.put(triple, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  delete(triple) {
    return new Promise((resolve, reject) => {
      this._db.del(triple, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  clear() {
    // The underlying level store has a clear() method, but I' m not sure that
    // it wouldn't break levelgraph to use that without it knowing.  Meanwhile,
    // this is the only way I found to empty out the thing.
    return new Promise((resolve, reject) =>
      this._db.search(
        {
          subject: this._db.v("subject"),
          predicate: this._db.v("predicate"),
          object: this._db.v("object"),
        },
        async (error, list) => {
          if (error) {
            reject(error);
            return;
          }
          for (const item of list) {
            await new Promise((del_resolve, del_reject) => {
              this._db.del(item, (del_error, dresult) => {
                if (del_error) del_reject(del_error);
                else del_resolve();
              });
            });
          }
          resolve();
        }
      )
    );
  }
};
