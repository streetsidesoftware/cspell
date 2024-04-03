# [Issue 5222](https://github.com/streetsidesoftware/cspell/issues/5222)

### Description

With a multi-lingual word list, the CSpell CLI throws an error while constructing a prefix tree from the dictionary.
See [this repro repo](https://github.com/1j01/cspell-bug-repro) for more info.
```
Isaiah@Cardboard MINGW64 ~/Projects/cspell-bug-repro (main)
$ npx cspell-cli lint .
TypeError: Cannot read properties of undefined (reading '0')
    at new FastTrieBlobINode (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-trie-lib/dist/lib/TrieBlob/FastTrieBlobIRoot.js:17:27)
    at FastTrieBlobINode.child (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-trie-lib/dist/lib/TrieBlob/FastTrieBlobIRoot.js:77:16)
    at nodeWalker (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-trie-lib/dist/lib/ITrieNode/walker/walker.js:58:30)
    at nodeWalker.next (<anonymous>)
    at get size [as size] (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-dictionary/dist/SpellingDictionary/SpellingDictionaryFromTrie.js:43:51)
    at file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-dictionary/dist/SpellingDictionary/SpellingDictionaryCollection.js:21:64
    at Array.sort (<anonymous>)
    at new SpellingDictionaryCollectionImpl (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-dictionary/dist/SpellingDictionary/SpellingDictionaryCollection.js:21:47)
    at createCollection (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-dictionary/dist/SpellingDictionary/SpellingDictionaryCollection.js:98:12)
    at _getDictionaryInternal (file:///C:/Users/Isaiah/Projects/cspell-bug-repro/node_modules/cspell-lib/dist/esm/SpellingDictionary/Dictionaries.js:50:12)
```

### Steps to Reproduce

- Run `cspell-cli lint .` with the given configuration file, and it throws an error.
- Also, open the `cspell.json` file in VS Code, and it reports a misspelling for one of the words in the accepted words list. Before trimming the word list, it reported even more words within the word list as misspelled.


### Expected Behavior

- `cspell-cli lint .` should not error.
- No words in the `words` array in `cspell.json` should be underlined in VS Code.

### Additional Information

There is likely a much smaller reproduction possible, but in the given configuration, removing any one word will make it fail to reproduce the bug.
I have not tried simplifying the reproduction by modifying the words themselves, although this may be elucidatory.

### cspell.json

```jsonc
{
	"ignorePaths": [
		".history", // VS Code "Local History" extension
		"node_modules"
	],
	"words": [
		"Æвзаг",
		"ajeļ",
		"allowfullscreen",
		"apng",
		"APNGs",
		"appinstalled",
		"Aragonés",
		"Asụsụ",
		"Avañe'ẽ",
		"Azərbaycan",
		"bepis",
		"bgcolor",
		"Bokmål",
		"Český",
		"Čeština",
		"classid",
		"cmaps",
		"ctype",
		"Cueŋƅ",
		"d'Òc",
		"desaturated",
		"DIALOGEX",
		"Divehi",
		"draggable",
		"ellipticals",
		"endonym",
		"eqeqeq",
		"equivalize",
		"ertical",
		"esque",
		"Eʋegbe",
		"eyedrop",
		"focusring",
		"Føroyskt",
		"fudgedness",
		"fullscreen",
		"Gàidhlig",
		"gazemouse",
		"GIFs",
		"Gikuyu",
		"grayscale",
		"headmouse",
		"hilight",
		"Hrvatski",
		"icns",
		"IFDs",
		"Íslenska",
		"Język",
		"jnordberg",
		"jspaint",
		"Kreyòl",
		"Kurdî",
		"Latviešu",
		"Lëtzebuergesch",
		"libtess",
		"Lietuvių",
		"Lingála",
		"llpaper",
		"localdomain",
		"localforage",
		"localizable",
		"lookpath",
		"lors",
		"ltres",
		"Macromedia",
		"nomine",
		"nostri",
		"nowrap",
		"occluder",
		"octree",
		"Oʻzbek",
		"oleobject",
		"orizontal",
		"ovaloids",
		"oviforms",
		"pako",
		"palettized",
		"paypal",
		"pointermove",
		"pointerup",
		"Português",
		"proxied",
		"pseudorandomly",
		"psppalette",
		"rbaycan",
		"redoable",
		"reenable",
		"repurposable",
		"rerender",
		"retargeted",
		"Română",
		"rotologo",
		"roundrects",
		"royskt",
		"rrect",
		"sandboxed",
		"scrollable",
		"scrollbars",
		"sketchpalette",
		"slenska",
		"Slovenčina",
		"Slovenščina",
		"Slovenský",
		"sorthweast",
		"soundcloud",
		"subrepo",
		"tbody",
		"themeable",
		"themepack",
		"Tiếng",
		"tileable",
		"timespan",
		"tina",
		"titlebar",
		"Toçikī",
		"togglable",
		"Tshivenḓa",
		"ufeff",
		"undock",
		"unfocusing",
		"uniquify",
		"unmaximize",
		"upiatun",
		"ustom",
		"UTIF",
		"vaporwave",
		"verts",
		"Việt",
		"viewports",
		"Volapük",
		"webglcontextlost",
		"webglcontextrestored",
		"Wikang",
		"ＷＩＮＴＲＡＰ",
		"Yângâ",
		"Zhōngwén",
		"zoomable",
		"zoomer",
		"zyk",
		"Ελληνικά",
		"Аҧсшәа",
		"Башҡорт",
		"Беларуская",
		"Език",
		"Ирон",
		"Језик",
		"Коми",
		"Қазақ",
		"Македонски",
		"Нохчийн",
		"Русский",
		"Словѣньскъ",
		"Српски",
		"Тоҷикӣ",
		"Түркмен",
		"Ўзбек",
		"Українська",
		"Чӑваш",
		"Чӗлхи",
		"Ѩзыкъ",
		"Ӏарул",
		"ქართული",
		"Հայերեն",
		"עברית",
		"أۇزبېك",
		"ئۇيغۇرچە",
		"اردو",
		"العربية",
		"بهاس",
		"پنجابی",
		"تاجیکی",
		"سندھی",
		"سنڌي",
		"فارسی",
		"كشميري",
		"ትግርኛ",
		"አማርኛ",
		"ພາສາລາວ",
		"ꦧꦱꦗꦮ",
		"ᐃᓄᒃᑎᑐᑦ",
		"ᐊᓂᔑᓈᐯᒧᐎᓐ",
		"ᓀᐦᐃᔭᐍᐏᐣ"
	]
}
```


### cspell.config.yaml

_No response_

### Example Repository

https://github.com/1j01/cspell-bug-repro

### Code of Conduct

- [X] I agree to follow this project's Code of Conduct
