"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[32408],{70280:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>r,contentTitle:()=>o,default:()=>u,frontMatter:()=>l,metadata:()=>d,toc:()=>c});var i=s(86106),t=s(82036);const l={},o="Interface: SuggestionsConfiguration",d={id:"api/cspell-lib/interfaces/SuggestionsConfiguration",title:"Interface: SuggestionsConfiguration",description:"Extended by",source:"@site/docs/api/cspell-lib/interfaces/SuggestionsConfiguration.md",sourceDirName:"api/cspell-lib/interfaces",slug:"/api/cspell-lib/interfaces/SuggestionsConfiguration",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionsConfiguration",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/api/cspell-lib/interfaces/SuggestionsConfiguration.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Interface: SuggestionResult",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionResult"},next:{title:"Interface: SuggestionsForWordResult",permalink:"/docsV2/docs/api/cspell-lib/interfaces/SuggestionsForWordResult"}},r={},c=[{value:"Extended by",id:"extended-by",level:2},{value:"Properties",id:"properties",level:2},{value:"numSuggestions?",id:"numsuggestions",level:3},{value:"Default",id:"default",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"suggestionNumChanges?",id:"suggestionnumchanges",level:3},{value:"Default",id:"default-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"suggestionsTimeout?",id:"suggestionstimeout",level:3},{value:"Default",id:"default-2",level:4},{value:"Defined in",id:"defined-in-2",level:4}];function a(e){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"interface-suggestionsconfiguration",children:"Interface: SuggestionsConfiguration"})}),"\n",(0,i.jsx)(n.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/docsV2/docs/api/cspell-lib/interfaces/ReportingConfiguration",children:(0,i.jsx)(n.code,{children:"ReportingConfiguration"})})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(n.h3,{id:"numsuggestions",children:"numSuggestions?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"numSuggestions"}),": ",(0,i.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Number of suggestions to make."}),"\n",(0,i.jsx)(n.h4,{id:"default",children:"Default"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"10\n"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"packages/cspell-types/dist/CSpellSettingsDef.d.ts:257"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"suggestionnumchanges",children:"suggestionNumChanges?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"suggestionNumChanges"}),": ",(0,i.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The maximum number of changes allowed on a word to be considered a suggestions."}),"\n",(0,i.jsxs)(n.p,{children:["For example, appending an ",(0,i.jsx)(n.code,{children:"s"})," onto ",(0,i.jsx)(n.code,{children:"example"})," -> ",(0,i.jsx)(n.code,{children:"examples"})," is considered 1 change."]}),"\n",(0,i.jsx)(n.p,{children:"Range: between 1 and 5."}),"\n",(0,i.jsx)(n.h4,{id:"default-1",children:"Default"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"3\n"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"packages/cspell-types/dist/CSpellSettingsDef.d.ts:273"}),"\n",(0,i.jsx)(n.hr,{}),"\n",(0,i.jsx)(n.h3,{id:"suggestionstimeout",children:"suggestionsTimeout?"}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"optional"})," ",(0,i.jsx)(n.strong,{children:"suggestionsTimeout"}),": ",(0,i.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The maximum amount of time in milliseconds to generate suggestions for a word."}),"\n",(0,i.jsx)(n.h4,{id:"default-2",children:"Default"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-ts",children:"500\n"})}),"\n",(0,i.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(n.p,{children:"packages/cspell-types/dist/CSpellSettingsDef.d.ts:263"})]})}function u(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},82036:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>d});var i=s(7378);const t={},l=i.createContext(t);function o(e){const n=i.useContext(l);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:o(e.components),i.createElement(l.Provider,{value:n},e.children)}}}]);