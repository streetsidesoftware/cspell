"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[14420],{27292:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>i,contentTitle:()=>l,default:()=>h,frontMatter:()=>c,metadata:()=>d,toc:()=>o});var r=n(86106),t=n(79252);const c={},l="Interface: ParsedText",d={id:"api/cspell/interfaces/ParsedText",title:"Interface: ParsedText",description:"Properties",source:"@site/docs/api/cspell/interfaces/ParsedText.md",sourceDirName:"api/cspell/interfaces",slug:"/api/cspell/interfaces/ParsedText",permalink:"/docsV2/docs/api/cspell/interfaces/ParsedText",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/api/cspell/interfaces/ParsedText.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Interface: ParseResult",permalink:"/docsV2/docs/api/cspell/interfaces/ParseResult"},next:{title:"Interface: Parser",permalink:"/docsV2/docs/api/cspell/interfaces/Parser"}},i={},o=[{value:"Properties",id:"properties",level:2},{value:"delegate?",id:"delegate",level:3},{value:"Source",id:"source",level:4},{value:"map?",id:"map",level:3},{value:"Source",id:"source-1",level:4},{value:"range",id:"range",level:3},{value:"Source",id:"source-2",level:4},{value:"rawText?",id:"rawtext",level:3},{value:"Source",id:"source-3",level:4},{value:"scope?",id:"scope",level:3},{value:"Source",id:"source-4",level:4},{value:"text",id:"text",level:3},{value:"Source",id:"source-5",level:4}];function a(e){const s={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",p:"p",strong:"strong",...(0,t.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.h1,{id:"interface-parsedtext",children:"Interface: ParsedText"}),"\n",(0,r.jsx)(s.h2,{id:"properties",children:"Properties"}),"\n",(0,r.jsx)(s.h3,{id:"delegate",children:"delegate?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"delegate"}),": ",(0,r.jsx)(s.code,{children:"DelegateInfo"})]}),"\n"]}),"\n",(0,r.jsxs)(s.p,{children:["Used to delegate parsing the contents of ",(0,r.jsx)(s.code,{children:"text"})," to another parser."]}),"\n",(0,r.jsx)(s.h4,{id:"source",children:"Source"}),"\n",(0,r.jsx)(s.p,{children:"cspell-types/dist/Parser/index.d.ts:47"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"map",children:"map?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"map"}),": ",(0,r.jsx)(s.code,{children:"SourceMap"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"The source map is used to support text transformations."}),"\n",(0,r.jsx)(s.p,{children:"See: SourceMap"}),"\n",(0,r.jsx)(s.h4,{id:"source-1",children:"Source"}),"\n",(0,r.jsx)(s.p,{children:"cspell-types/dist/Parser/index.d.ts:42"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"range",children:"range"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"range"}),": ",(0,r.jsx)(s.code,{children:"Range"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"start and end offsets of the text"}),"\n",(0,r.jsx)(s.h4,{id:"source-2",children:"Source"}),"\n",(0,r.jsx)(s.p,{children:"cspell-types/dist/Parser/index.d.ts:30"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"rawtext",children:"rawText?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"rawText"}),": ",(0,r.jsx)(s.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"The raw text before it has been transformed"}),"\n",(0,r.jsx)(s.h4,{id:"source-3",children:"Source"}),"\n",(0,r.jsx)(s.p,{children:"cspell-types/dist/Parser/index.d.ts:26"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"scope",children:"scope?"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"optional"})," ",(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"scope"}),": ",(0,r.jsx)(s.code,{children:"Scope"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"The Scope annotation for a segment of text.\nUsed by the spell checker to apply spell checking options\nbased upon the value of the scope."}),"\n",(0,r.jsx)(s.h4,{id:"source-4",children:"Source"}),"\n",(0,r.jsx)(s.p,{children:"cspell-types/dist/Parser/index.d.ts:36"}),"\n",(0,r.jsx)(s.hr,{}),"\n",(0,r.jsx)(s.h3,{id:"text",children:"text"}),"\n",(0,r.jsxs)(s.blockquote,{children:["\n",(0,r.jsxs)(s.p,{children:[(0,r.jsx)(s.code,{children:"readonly"})," ",(0,r.jsx)(s.strong,{children:"text"}),": ",(0,r.jsx)(s.code,{children:"string"})]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"The text extracted and possibly transformed"}),"\n",(0,r.jsx)(s.h4,{id:"source-5",children:"Source"}),"\n",(0,r.jsx)(s.p,{children:"cspell-types/dist/Parser/index.d.ts:22"})]})}function h(e={}){const{wrapper:s}={...(0,t.R)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(a,{...e})}):a(e)}},79252:(e,s,n)=>{n.d(s,{R:()=>l,x:()=>d});var r=n(7378);const t={},c=r.createContext(t);function l(e){const s=r.useContext(c);return r.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function d(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:l(e.components),r.createElement(c.Provider,{value:s},e.children)}}}]);