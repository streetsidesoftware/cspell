import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FirstComponent from './components/FirstComponent';
import UserComponent from './components/UserComponent';
ReactDOM.render(
    <div>
        <h1>Hello, Welcomeeeee to React and TypeScript</h1>
        <FirstComponent />
        <UserComponent name="John Doe" age={26} address="87 Summmer St, Boston, MA 02110" dob={new Date()} />
    </div>,
    document.getElementById('root')
);
