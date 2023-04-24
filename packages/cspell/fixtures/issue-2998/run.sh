../../bin.mjs -v --language-id=fix fix-words.txt

cat fix-words.txt | ../../bin.mjs -v --language-id=fix "--locale=*" stdin
