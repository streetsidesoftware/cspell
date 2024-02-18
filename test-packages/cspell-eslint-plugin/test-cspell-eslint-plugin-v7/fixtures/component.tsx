import * as React from 'react';

/**
 * This is acomment.
 */

const Logo = 'https://example.com/logo.svg';
export default class FirstComponent extends React.Component<object> {
    render() {
        return (
            <div>
                <h3>A Simplle React Component Example with Typescript</h3>
                <div>
                    <img height="250" src={Logo} />
                </div>
                <p>This component shows the logo.</p>
                <p>For more infoo, pleese visit https://example.com </p>
            </div>
        );
    }
}
