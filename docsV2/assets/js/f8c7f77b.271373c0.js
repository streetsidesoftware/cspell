"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[43229],{62773:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>d,default:()=>h,frontMatter:()=>r,metadata:()=>l,toc:()=>o});var s=t(86106),i=t(93309);const r={layout:"default",title:"Exclude / Include Patterns",categories:"configuration",parent:"Configuration",nav_order:11},d="Exclude / Include Patterns",l={id:"Configuration/patterns",title:"Exclude / Include Patterns",description:"Covers:",source:"@site/docs/Configuration/patterns.md",sourceDirName:"Configuration",slug:"/Configuration/patterns",permalink:"/docsV2/docs/Configuration/patterns",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/cspell/tree/main/website/docs/docs/Configuration/patterns.md",tags:[],version:"current",frontMatter:{layout:"default",title:"Exclude / Include Patterns",categories:"configuration",parent:"Configuration",nav_order:11},sidebar:"tutorialSidebar",previous:{title:"Overrides",permalink:"/docsV2/docs/Configuration/overrides"},next:{title:"Default Dictionaries",permalink:"/docsV2/docs/dictionaries/"}},c={},o=[{value:"Predefined Patterns",id:"predefined-patterns",level:2},{value:"Default <code>ignoreRegExpList</code> Patterns",id:"default-ignoreregexplist-patterns",level:2}];function a(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"exclude--include-patterns",children:"Exclude / Include Patterns"})}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Covers:"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"patterns"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"ignoreRegExpList"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"includeRegExpList"})}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The spell checker combines the ",(0,s.jsx)(n.code,{children:"patterns"}),", the ",(0,s.jsx)(n.code,{children:"ignoreRegExpList"}),", and the ",(0,s.jsx)(n.code,{children:"includeRegExpList"})," settings based upon the ",(0,s.jsx)(n.code,{children:"overrides"})," and ",(0,s.jsx)(n.code,{children:"languageSettings"})," for the file."]}),"\n",(0,s.jsxs)(n.p,{children:["It uses ",(0,s.jsx)(n.code,{children:"includeRegExpList"})," and ",(0,s.jsx)(n.code,{children:"ignoreRegExpList"})," in the following way:"]}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["Make a set of text to be included by matching against ",(0,s.jsx)(n.code,{children:"includeRegExpList"})," (if empty, include everything)."]}),"\n",(0,s.jsxs)(n.li,{children:["Make a set of text to be excluded by matching against ",(0,s.jsx)(n.code,{children:"ignoreRegExpList"}),"."]}),"\n",(0,s.jsx)(n.li,{children:"Check all text that is included but not excluded."}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"includeRegExpList"})," and ",(0,s.jsx)(n.code,{children:"ignoreRegExpList"})," can include regular expressions or pattern names. Pattern names resolved against patterns defined in ",(0,s.jsx)(n.code,{children:"patterns"}),"."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Example:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"ignoreRegExpList:\n  - Email\n  - >-\n    /ftp:[^\\s]*/g\n"})}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Explained:"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Email"})," is a predefined pattern."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"/ftp:[^\\s]*/g"})," - will match anything that starts with ",(0,s.jsx)(n.code,{children:"ftp:"})," until the first space."]}),"\n"]}),"\n",(0,s.jsx)(n.h1,{id:"patterns",children:"Patterns"}),"\n",(0,s.jsxs)(n.p,{children:["Patterns allow you to define reusable patterns for excluding or including text to be spell checked. To exclude text matching a pattern from being spell checked, include it the ",(0,s.jsx)(n.code,{children:"ignoreRegExpList"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"predefined-patterns",children:"Predefined Patterns"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["See: ",(0,s.jsx)(n.a,{href:"https://cspell.org/types/cspell-types/types/PredefinedPatterns.html",children:"Predefined Patterns"})]}),"\n"]}),"\n",(0,s.jsxs)(n.h2,{id:"default-ignoreregexplist-patterns",children:["Default ",(0,s.jsx)(n.code,{children:"ignoreRegExpList"})," Patterns"]}),"\n",(0,s.jsx)(n.p,{children:"The following patterns are used by default to ignore non-text content."}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"    Urls\n    Email\n    RsaCert\n    SshRsa\n    Base64MultiLine\n    Base64SingleLine\n    CommitHash\n    CommitHashLink\n    CStyleHexValue\n    CSSHexValue\n    SHA\n    HashStrings\n    UnicodeRef\n    UUID\n"})}),"\n",(0,s.jsx)(n.h1,{id:"verbose-regular-expressions",children:"Verbose Regular Expressions"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Version"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"^6.9.0"}),(0,s.jsx)(n.td,{children:"Initial support"})]})})]}),"\n",(0,s.jsxs)(n.p,{children:["Defining RegExp Patterns in ",(0,s.jsx)(n.code,{children:".json"})," or ",(0,s.jsx)(n.code,{children:".yaml"})," CSpell config files can be difficult."]}),"\n",(0,s.jsxs)(n.p,{children:["This feature makes it easier to define patterns in a ",(0,s.jsx)(n.code,{children:".yaml"})," file."]}),"\n",(0,s.jsxs)(n.p,{children:["CSpell now supports the ",(0,s.jsx)(n.code,{children:"x"})," - verbose flag."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-regexp",children:"/\n    ^(\\s*`{3,}).*     # match the ```\n    [\\s\\S]*?          # the block of code\n    ^\\1               # end of the block\n/gmx\n"})}),"\n",(0,s.jsxs)(n.p,{children:["Example of Ignoring code block in ",(0,s.jsx)(n.code,{children:"markdown"}),"."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.code,{children:"cspell.config.yaml"})})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"patterns:\n  - name: markdown_code_block\n    pattern: |\n      /\n          ^(\\s*`{3,}).*     # match the ```\n          [\\s\\S]*?          # the block of code\n          ^\\1               # end of the block\n      /gmx\nlanguageSettings:\n  - languageId: markdown\n    ignoreRegExpList:\n      - markdown_code_block\n"})}),"\n",(0,s.jsxs)(n.p,{children:["Leading and trailing spaces are automatically trimmed from patterns, make it possible to avoid escaping in YAML by using ",(0,s.jsx)(n.code,{children:">"})," without the trailing ",(0,s.jsx)(n.code,{children:"-"}),"."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"ignoreRegExpList:\n  - >\n    /auth_token: .*/g\n  - >-\n    /this works too/g\n"})})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},93309:(e,n,t)=>{t.d(n,{R:()=>d,x:()=>l});var s=t(7378);const i={},r=s.createContext(i);function d(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:d(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);