"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[88130],{8456:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>r,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>c});var n=t(86106),i=t(93309);const a={},o="Type Alias: SuggestionCostMapDef",l={id:"api/cspell-types/type-aliases/SuggestionCostMapDef",title:"Type Alias: SuggestionCostMapDef",description:"SuggestionCostMapDef: CostMapDefReplace \\| CostMapDefInsDel \\| CostMapDefSwap",source:"@site/docs/api/cspell-types/type-aliases/SuggestionCostMapDef.md",sourceDirName:"api/cspell-types/type-aliases",slug:"/api/cspell-types/type-aliases/SuggestionCostMapDef",permalink:"/docsV2/docs/api/cspell-types/type-aliases/SuggestionCostMapDef",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/api/cspell-types/type-aliases/SuggestionCostMapDef.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Type Alias: SpellingErrorEmitter()",permalink:"/docsV2/docs/api/cspell-types/type-aliases/SpellingErrorEmitter"},next:{title:"Type Alias: SuggestionCostsDefs",permalink:"/docsV2/docs/api/cspell-types/type-aliases/SuggestionCostsDefs"}},r={},c=[{value:"Defined in",id:"defined-in",level:2}];function p(e){const s={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",strong:"strong",...(0,i.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.header,{children:(0,n.jsx)(s.h1,{id:"type-alias-suggestioncostmapdef",children:"Type Alias: SuggestionCostMapDef"})}),"\n",(0,n.jsxs)(s.blockquote,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"SuggestionCostMapDef"}),": ",(0,n.jsx)(s.code,{children:"CostMapDefReplace"})," | ",(0,n.jsx)(s.code,{children:"CostMapDefInsDel"})," | ",(0,n.jsx)(s.code,{children:"CostMapDefSwap"})]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:"A WeightedMapDef enables setting weights for edits between related characters and substrings."}),"\n",(0,n.jsxs)(s.p,{children:["Multiple groups can be defined using a ",(0,n.jsx)(s.code,{children:"|"}),".\nA multi-character substring is defined using ",(0,n.jsx)(s.code,{children:"()"}),"."]}),"\n",(0,n.jsx)(s.p,{children:"For example, in some languages, some letters sound alike."}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-yaml",children:"  map: 'sc(sh)(sch)(ss)|t(tt)' # two groups.\n  replace: 50    # Make it 1/2 the cost of a normal edit to replace a `t` with `tt`.\n"})}),"\n",(0,n.jsx)(s.p,{children:"The following could be used to make inserting, removing, or replacing vowels cheaper."}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-yaml",children:"  map: 'aeiouy'\n  insDel: 50     # Make it is cheaper to insert or delete a vowel.\n  replace: 45    # It is even cheaper to replace one with another.\n"})}),"\n",(0,n.jsx)(s.p,{children:"Note: the default edit distance is 100."}),"\n",(0,n.jsx)(s.h2,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/streetsidesoftware/cspell/blob/7a21e56b29b1d40a06b34c20525faef729f28897/packages/cspell-types/src/suggestionCostsDef.ts#L24",children:"suggestionCostsDef.ts:24"})})]})}function d(e={}){const{wrapper:s}={...(0,i.R)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(p,{...e})}):p(e)}},93309:(e,s,t)=>{t.d(s,{R:()=>o,x:()=>l});var n=t(7378);const i={},a=n.createContext(i);function o(e){const s=n.useContext(a);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function l(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),n.createElement(a.Provider,{value:s},e.children)}}}]);