"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[98467],{21070:(e,i,s)=>{s.r(i),s.d(i,{assets:()=>c,contentTitle:()=>l,default:()=>a,frontMatter:()=>r,metadata:()=>t,toc:()=>o});var n=s(86106),d=s(93309);const r={},l="Interface: SuggestedWord",t={id:"api/cspell-lib/interfaces/SuggestedWord",title:"Interface: SuggestedWord",description:"Extends",source:"@site/docs/api/cspell-lib/interfaces/SuggestedWord.md",sourceDirName:"api/cspell-lib/interfaces",slug:"/api/cspell-lib/interfaces/SuggestedWord",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestedWord",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/api/cspell-lib/interfaces/SuggestedWord.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Interface: SuggestOptions",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestOptions"},next:{title:"Interface: SuggestionCollector",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionCollector"}},c={},o=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"compoundWord?",id:"compoundword",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"cost",id:"cost",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"dictionaries",id:"dictionaries",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"forbidden",id:"forbidden",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isPreferred?",id:"ispreferred",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"noSuggest",id:"nosuggest",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"word",id:"word",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"wordAdjustedToMatchCase?",id:"wordadjustedtomatchcase",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-7",level:4}];function h(e){const i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,d.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.header,{children:(0,n.jsx)(i.h1,{id:"interface-suggestedword",children:"Interface: SuggestedWord"})}),"\n",(0,n.jsx)(i.h2,{id:"extends",children:"Extends"}),"\n",(0,n.jsxs)(i.ul,{children:["\n",(0,n.jsx)(i.li,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase"})}),"\n"]}),"\n",(0,n.jsx)(i.h2,{id:"properties",children:"Properties"}),"\n",(0,n.jsx)(i.h3,{id:"compoundword",children:"compoundWord?"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"optional"})," ",(0,n.jsx)(i.strong,{children:"compoundWord"}),": ",(0,n.jsx)(i.code,{children:"string"})]}),"\n"]}),"\n",(0,n.jsxs)(i.p,{children:["The suggested word with compound marks, generally a ",(0,n.jsx)(i.code,{children:"\u2022"})]}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase.compoundWord"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:16"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"cost",children:"cost"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"cost"}),": ",(0,n.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"The edit cost 100 = 1 edit"}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase.cost"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:7"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"dictionaries",children:"dictionaries"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"dictionaries"}),": ",(0,n.jsx)(i.code,{children:"string"}),"[]"]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"dictionary names"}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase.dictionaries"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/streetsidesoftware/cspell/blob/7a21e56b29b1d40a06b34c20525faef729f28897/packages/cspell-lib/src/lib/suggestions.ts#L29",children:"packages/cspell-lib/src/lib/suggestions.ts:29"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"forbidden",children:"forbidden"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"forbidden"}),": ",(0,n.jsx)(i.code,{children:"boolean"})]}),"\n"]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/streetsidesoftware/cspell/blob/7a21e56b29b1d40a06b34c20525faef729f28897/packages/cspell-lib/src/lib/suggestions.ts#L34",children:"packages/cspell-lib/src/lib/suggestions.ts:34"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"ispreferred",children:"isPreferred?"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"optional"})," ",(0,n.jsx)(i.strong,{children:"isPreferred"}),": ",(0,n.jsx)(i.code,{children:"boolean"})]}),"\n"]}),"\n",(0,n.jsxs)(i.p,{children:["This suggestion is the preferred suggestion.\nSetting this to ",(0,n.jsx)(i.code,{children:"true"})," implies that an auto fix is possible."]}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-3",children:"Inherited from"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase.isPreferred"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:12"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"nosuggest",children:"noSuggest"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"noSuggest"}),": ",(0,n.jsx)(i.code,{children:"boolean"})]}),"\n"]}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/streetsidesoftware/cspell/blob/7a21e56b29b1d40a06b34c20525faef729f28897/packages/cspell-lib/src/lib/suggestions.ts#L33",children:"packages/cspell-lib/src/lib/suggestions.ts:33"})}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"word",children:"word"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.strong,{children:"word"}),": ",(0,n.jsx)(i.code,{children:"string"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"The suggested word"}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-4",children:"Inherited from"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase.word"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:5"}),"\n",(0,n.jsx)(i.hr,{}),"\n",(0,n.jsx)(i.h3,{id:"wordadjustedtomatchcase",children:"wordAdjustedToMatchCase?"}),"\n",(0,n.jsxs)(i.blockquote,{children:["\n",(0,n.jsxs)(i.p,{children:[(0,n.jsx)(i.code,{children:"optional"})," ",(0,n.jsx)(i.strong,{children:"wordAdjustedToMatchCase"}),": ",(0,n.jsx)(i.code,{children:"string"})]}),"\n"]}),"\n",(0,n.jsx)(i.p,{children:"The suggested word adjusted to match the original case."}),"\n",(0,n.jsx)(i.h4,{id:"inherited-from-5",children:"Inherited from"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.code,{children:"SuggestedWordBase.wordAdjustedToMatchCase"})}),"\n",(0,n.jsx)(i.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,n.jsx)(i.p,{children:(0,n.jsx)(i.a,{href:"https://github.com/streetsidesoftware/cspell/blob/7a21e56b29b1d40a06b34c20525faef729f28897/packages/cspell-lib/src/lib/suggestions.ts#L22",children:"packages/cspell-lib/src/lib/suggestions.ts:22"})})]})}function a(e={}){const{wrapper:i}={...(0,d.R)(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(h,{...e})}):h(e)}},93309:(e,i,s)=>{s.d(i,{R:()=>l,x:()=>t});var n=s(7378);const d={},r=n.createContext(d);function l(e){const i=n.useContext(r);return n.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function t(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),n.createElement(r.Provider,{value:i},e.children)}}}]);