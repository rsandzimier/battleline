import React from 'react';

export class Header extends React.Component {
    render() {
         return (
            <table style={{width:"100%"}} bgcolor="#E4DB86">
                <tbody>
                    <tr>
                        <td style={{fontFamily:"Verdana", fontSize:"30px",padding:"10px"}}>
                            BATTLE LINE
                        </td>
                        <td style={{textAlign:"right"}}>
                            <a href="https://github.com/rsandzimier/battleline">
                                <img id="github" src="https://pngimg.com/uploads/github/github_PNG58.png" style={{height:"50px"}} />
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
         );
    }
}