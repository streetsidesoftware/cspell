"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[67915],{74072:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>o,contentTitle:()=>i,default:()=>h,frontMatter:()=>c,metadata:()=>r,toc:()=>a});var t=n(86106),l=n(79252);const c={},i="Interface: EditCosts",r={id:"api/cspell-lib/interfaces/EditCosts",title:"Interface: EditCosts",description:"Properties",source:"@site/docs/api/cspell-lib/interfaces/EditCosts.md",sourceDirName:"api/cspell-lib/interfaces",slug:"/api/cspell-lib/interfaces/EditCosts",permalink:"/docsV2/docs/api/cspell-lib/interfaces/EditCosts",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/api/cspell-lib/interfaces/EditCosts.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Interface: DocumentValidatorOptions",permalink:"/docsV2/docs/api/cspell-lib/interfaces/DocumentValidatorOptions"},next:{title:"Interface: ExcludeFilesGlobMap",permalink:"/docsV2/docs/api/cspell-lib/interfaces/ExcludeFilesGlobMap"}},o={},a=[{value:"Properties",id:"properties",level:2},{value:"accentCosts?",id:"accentcosts",level:3},{value:"Default",id:"default",level:4},{value:"Source",id:"source",level:4},{value:"baseCost?",id:"basecost",level:3},{value:"Default",id:"default-1",level:4},{value:"Source",id:"source-1",level:4},{value:"capsCosts?",id:"capscosts",level:3},{value:"Default",id:"default-2",level:4},{value:"Source",id:"source-2",level:4},{value:"firstLetterPenalty?",id:"firstletterpenalty",level:3},{value:"Default",id:"default-3",level:4},{value:"Source",id:"source-3",level:4},{value:"nonAlphabetCosts?",id:"nonalphabetcosts",level:3},{value:"Default",id:"default-4",level:4},{value:"Source",id:"source-4",level:4}];function d(e){const s={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",p:"p",pre:"pre",strong:"strong",...(0,l.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.h1,{id:"interface-editcosts",children:"Interface: EditCosts"}),"\n",(0,t.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,t.jsx)(s.h3,{id:"accentcosts",children:"accentCosts?"}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"optional"})," ",(0,t.jsx)(s.strong,{children:"accentCosts"}),": ",(0,t.jsx)(s.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(s.p,{children:"The cost to add / remove an accent\nThis should be very cheap, it helps with fixing accent issues."}),"\n",(0,t.jsx)(s.h4,{id:"default",children:"Default"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-ts",children:"1\n"})}),"\n",(0,t.jsx)(s.h4,{id:"source",children:"Source"}),"\n",(0,t.jsx)(s.p,{children:"packages/cspell-types/dist/DictionaryInformation.d.ts:176"}),"\n",(0,t.jsx)(s.hr,{}),"\n",(0,t.jsx)(s.h3,{id:"basecost",children:"baseCost?"}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"optional"})," ",(0,t.jsx)(s.strong,{children:"baseCost"}),": ",(0,t.jsx)(s.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(s.p,{children:"This is the base cost for making an edit."}),"\n",(0,t.jsx)(s.h4,{id:"default-1",children:"Default"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-ts",children:"100\n"})}),"\n",(0,t.jsx)(s.h4,{id:"source-1",children:"Source"}),"\n",(0,t.jsx)(s.p,{children:"packages/cspell-types/dist/DictionaryInformation.d.ts:153"}),"\n",(0,t.jsx)(s.hr,{}),"\n",(0,t.jsx)(s.h3,{id:"capscosts",children:"capsCosts?"}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"optional"})," ",(0,t.jsx)(s.strong,{children:"capsCosts"}),": ",(0,t.jsx)(s.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(s.p,{children:"The cost to change capitalization.\nThis should be very cheap, it helps with fixing capitalization issues."}),"\n",(0,t.jsx)(s.h4,{id:"default-2",children:"Default"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-ts",children:"1\n"})}),"\n",(0,t.jsx)(s.h4,{id:"source-2",children:"Source"}),"\n",(0,t.jsx)(s.p,{children:"packages/cspell-types/dist/DictionaryInformation.d.ts:170"}),"\n",(0,t.jsx)(s.hr,{}),"\n",(0,t.jsx)(s.h3,{id:"firstletterpenalty",children:"firstLetterPenalty?"}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"optional"})," ",(0,t.jsx)(s.strong,{children:"firstLetterPenalty"}),": ",(0,t.jsx)(s.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsxs)(s.p,{children:["The extra cost incurred for changing the first letter of a word.\nThis value should be less than ",(0,t.jsx)(s.code,{children:"100 - baseCost"}),"."]}),"\n",(0,t.jsx)(s.h4,{id:"default-3",children:"Default"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-ts",children:"4\n"})}),"\n",(0,t.jsx)(s.h4,{id:"source-3",children:"Source"}),"\n",(0,t.jsx)(s.p,{children:"packages/cspell-types/dist/DictionaryInformation.d.ts:164"}),"\n",(0,t.jsx)(s.hr,{}),"\n",(0,t.jsx)(s.h3,{id:"nonalphabetcosts",children:"nonAlphabetCosts?"}),"\n",(0,t.jsxs)(s.blockquote,{children:["\n",(0,t.jsxs)(s.p,{children:[(0,t.jsx)(s.code,{children:"optional"})," ",(0,t.jsx)(s.strong,{children:"nonAlphabetCosts"}),": ",(0,t.jsx)(s.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(s.p,{children:"This is the cost for characters not in the alphabet."}),"\n",(0,t.jsx)(s.h4,{id:"default-4",children:"Default"}),"\n",(0,t.jsx)(s.pre,{children:(0,t.jsx)(s.code,{className:"language-ts",children:"110\n"})}),"\n",(0,t.jsx)(s.h4,{id:"source-4",children:"Source"}),"\n",(0,t.jsx)(s.p,{children:"packages/cspell-types/dist/DictionaryInformation.d.ts:158"})]})}function h(e={}){const{wrapper:s}={...(0,l.R)(),...e.components};return s?(0,t.jsx)(s,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},79252:(e,s,n)=>{n.d(s,{R:()=>i,x:()=>r});var t=n(7378);const l={},c=t.createContext(l);function i(e){const s=t.useContext(c);return t.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function r(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:i(e.components),t.createElement(c.Provider,{value:s},e.children)}}}]);