../../bin.js -v --language-id=fix fix-words.txt

cat fix-words.txt | ../../bin.js -v --language-id=fix "--locale=*" stdin
