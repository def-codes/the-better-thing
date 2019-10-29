// PROVISIONAL: These are not actually used (see stream-expressions and
// transducer-expressions).  This was just thinking out loud.

import { Transducer } from "@thi.ng/transducers";

export interface ProcessExpression<T> {}

export interface StreamSyncExpression<T> {}
export interface StreamMergeExpression<T> {}
export interface StreamSidechainPartitionExpression<T> {}
export interface StreamSidechainToggleExpression<T> {}
export interface StreamBisectExpression<T> {}
export type StreamSourceExpression<T> =
  | StreamSyncExpression<T>
  | StreamMergeExpression<T>
  | StreamSidechainPartitionExpression<T>
  | StreamSidechainToggleExpression<T>
  | StreamBisectExpression<T>;

export interface SimpleTransducerExpression<A, B> {}
export interface TransducerPipelineExpression<A, B> {
  readonly transforms: readonly TransducerExpression<any, any>[];
}

export interface TransducerPipelineExpressionConstructor<A, Z> {
  (expr1: TransducerExpression<A, Z>): TransducerPipelineExpression<A, Z>;
  <B>(
    expr1: TransducerExpression<A, B>,
    expr2: TransducerExpression<B, Z>
  ): TransducerPipelineExpression<A, Z>;
  <B, C>(
    expr1: TransducerExpression<A, B>,
    expr2: TransducerExpression<B, C>,
    expr3: TransducerExpression<C, Z>
  ): TransducerPipelineExpression<A, Z>;
  <B, C, D>(
    expr1: TransducerExpression<A, B>,
    expr2: TransducerExpression<B, C>,
    expr3: TransducerExpression<C, D>,
    expr4: TransducerExpression<D, Z>
  ): TransducerPipelineExpression<A, Z>;
  <B, C, D, E>(
    expr1: TransducerExpression<A, B>,
    expr2: TransducerExpression<B, C>,
    expr3: TransducerExpression<C, D>,
    expr4: TransducerExpression<D, E>,
    expr5: TransducerExpression<E, Z>
  ): TransducerPipelineExpression<A, Z>;
}
export interface TransducerMultiplexExpression<A, B> {}

export interface TransducerMultiplexExpressionConstructor<A, B> {
  <A, B>(
    map: { [K in keyof B]: TransducerExpression<A, B[K]> }
  ): TransducerMultiplexExpression<A, B>;
}

export type TransducerExpression<A, B> =
  | TransducerPipelineExpression<A, B>
  | TransducerMultiplexExpression<A, B>;

// interface Transducer<T> {}
