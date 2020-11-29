#!/bin/bash

# Run a graph PUT operation against a local service instance.

set -e

DEFAULT_TURTLE='
@prefix ex: <http://example.com/vocab#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@base <http://example.com/people/> .

<ex://Alice> a <ex://Person> 
  ; <http://schema.org/knows> <http://example.com/other/Bob>
  ; ex:loves <Carol>
  ; ex:label "Alice Appel"
  ; ex:label "Alice"@en
  ; ex:label "El Greco"@es
  ; ex:luckyNumber "3"^^xsd:decimal
  ; <http://schema.org/birthDate> "2010-07-19T20:00:00-05:00"^^xsd:dateTime
  ; ex:name "Alice"
  ; rdfs:comment """Alice is an imaginary personage with imaginary opinions.

Please do not confuse Alice with a real person having real opinions."""
.

<ex://Carol> a <ex://Person> 
  ; <http://schema.org/knows> [a  <ex://Person> ; ex:name "Alice"]
.
'

turtle="${1:-$DEFAULT_TURTLE}"
graph="${2:-default}"
port="${3:-1234}"
host="${4:-localhost}"

if [ "$graph" == 'default' ]; then
  query='default'
else
  # TODO: should be URL-encoded
  query="graph=${graph}"
fi

curl \
  --silent \
  --globoff \
  --request 'PUT' \
  --data "$turtle" \
  "${host}:${port}/kb/graph?${query}"

exit 0
