"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[79868],{17316:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>d,default:()=>u,frontMatter:()=>t,metadata:()=>l,toc:()=>c});var s=i(86106),r=i(82036);const t={},d="Interface: SuggestionResult",l={id:"api/cspell-lib/interfaces/SuggestionResult",title:"Interface: SuggestionResult",description:"Extends",source:"@site/docs/api/cspell-lib/interfaces/SuggestionResult.md",sourceDirName:"api/cspell-lib/interfaces",slug:"/api/cspell-lib/interfaces/SuggestionResult",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionResult",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/api/cspell-lib/interfaces/SuggestionResult.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Interface: SuggestionOptions",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionOptions"},next:{title:"Interface: SuggestionsConfiguration",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionsConfiguration"}},o={},c=[{value:"Extends",id:"extends",level:2},{value:"Properties",id:"properties",level:2},{value:"compoundWord?",id:"compoundword",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"cost",id:"cost",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"isPreferred?",id:"ispreferred",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"word",id:"word",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function h(e){const n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"interface-suggestionresult",children:"Interface: SuggestionResult"})}),"\n",(0,s.jsx)(n.h2,{id:"extends",children:"Extends"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"SuggestionResultBase"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"compoundword",children:"compoundWord?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"compoundWord"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The suggested word with compound marks, generally a ",(0,s.jsx)(n.code,{children:"\u2022"})]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:16"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"cost",children:"cost"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"cost"}),": ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The edit cost 100 = 1 edit"}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"SuggestionResultBase.cost"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:7"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"ispreferred",children:"isPreferred?"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"optional"})," ",(0,s.jsx)(n.strong,{children:"isPreferred"}),": ",(0,s.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["This suggestion is the preferred suggestion.\nSetting this to ",(0,s.jsx)(n.code,{children:"true"})," implies that an auto fix is possible."]}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from-1",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"SuggestionResultBase.isPreferred"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:12"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"word",children:"word"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"word"}),": ",(0,s.jsx)(n.code,{children:"string"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The suggested word"}),"\n",(0,s.jsx)(n.h4,{id:"inherited-from-2",children:"Inherited from"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"SuggestionResultBase.word"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"packages/cspell-trie-lib/dist/lib/suggestions/SuggestionTypes.d.ts:5"})]})}function u(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(h,{...e})}):h(e)}},82036:(e,n,i)=>{i.d(n,{R:()=>d,x:()=>l});var s=i(7378);const r={},t=s.createContext(r);function d(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:d(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);