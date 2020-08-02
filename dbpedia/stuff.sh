# pokin around dbpedia

grep -oe ' (\S+)' specific-mappingbased-properties_lang=en.ttl 
grep -oe ' ([^ ]+)' specific-mappingbased-properties_lang=en.ttl 
grep -o ' ([^ ]+)' specific-mappingbased-properties_lang=en.ttl 
grep -o ' \([^ ]+\)' specific-mappingbased-properties_lang=en.ttl 
grep -o ' \(\[^ \]+\)' specific-mappingbased-properties_lang=en.ttl 
grep -oe ' \(\[^ \]+\)' specific-mappingbased-properties_lang=en.ttl 
grep -oe ' ([^ ]*)' specific-mappingbased-properties_lang=en.ttl 
head  specific-mappingbased-properties_lang=en.ttl  | grep -oe ' ([^ ]*)'
head  specific-mappingbased-properties_lang=en.ttl  
| grep -oe '> <[^ ]*'
| grep -oe '\> \<[^ ]*'
head specific-mappingbased-properties_lang\=en.ttl | grep -oe '\> \<[^ ]*'
head specific-mappingbased-properties_lang\=en.ttl | grep -oe '> <[^ ]*'
head specific-mappingbased-properties_lang\=en.ttl | grep -oe ' <[^ ]*'
head specific-mappingbased-properties_lang\=en.ttl | grep -oe ' [^ ]*'
head specific-mappingbased-properties_lang\=en.ttl | grep -oe ' <[^ ]*'
cat specific-mappingbased-properties_lang\=en.ttl | grep -oe ' <[^ ]*'
cat specific-mappingbased-properties_lang\=en.ttl | grep -oe ' <[^ ]*' | sort | uniq
cat specific-mappingbased-properties_lang\=en.ttl | grep -oe ' <[^ ]*' | sort | uniq -c | sort -rn
grep 'http://dbpedia.org/ontology/Person/height' specific-mappingbased-properties_lang\=en.ttl 
grep 'http://dbpedia.org/ontology/Person/height' specific-mappingbased-properties_lang\=en.ttl  | cut -d' ' -f1
head wikipedia-links_lang\=en.ttl 
tail wikipedia-links_lang\=en.ttl 
grep Shaksp wikipedia-links_lang\=en.ttl 
grep 'pandemonium' long-abstracts_lang=en.ttl | cut -d\  -f1
