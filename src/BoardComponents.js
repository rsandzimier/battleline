import React from 'react';

// function rect(props) {
//     const {ctx, x, y, width, height} = props;
//     ctx.fillRect(x, y, width, height);
// }
var COLOR_MAP = new Map([["r","#FF0000"],["o","#FFA500"],["y","#FFFF00"],["g","#008000"],["b","#0000FF"],["p","#800080"]]);

export class Card extends React.Component {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {    
        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0,0, 80, 120);
        if (this.props.str.length == 2){
            drawTroopCardFront(ctx, this.props.str);
        }
        else if (this.props.str == 'troop'){
            drawTroopCardBack(ctx);
        }
    }

    render() {
         return (
             <canvas ref="canvas" width={80} height={120}/>
         );
    }
}

export class Formation extends React.Component {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {    
        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0,0, 80, 190);
        if (this.props.side === 'top'){
            ctx.translate(0,70);
            for (let i = 0; i != this.props.cards.length; i++){
                drawTroopCardFront(ctx, this.props.cards[i]);
                ctx.translate(0,-35);
            }
            ctx.translate(0,-35*(2-this.props.cards.length))
        }
        else{
            for (let i = 0; i != this.props.cards.length; i++){
                drawTroopCardFront(ctx, this.props.cards[i]);
                ctx.translate(0,35);
            }
            ctx.translate(0,-35*this.props.cards.length)
        }
        if (this.props.show_flag){
            let y_offset = this.props.side === 'top' ? 35:105;
            drawFlag(ctx, y_offset);
        }
        
    }

    render() {
         return (
             <canvas ref="canvas" width={80} height={190}/>
         );
    }   
}

export class Flag extends React.Component {
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {    
        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0,0, 80, 50);
        if (this.props.show_flag){
            drawFlag(ctx, 0);
        }
    }
    render() {
         return (
             <canvas ref="canvas" width={80} height={50}/>
         );
    }   
}

function drawTroopCardFront(ctx, card_str){
    let card_width = 80;
    let card_height = 120;
    let padding = 7;
    let inset_width = 20;
    let inset_height = 25;
    let val = card_str[0];
    let color = card_str[1];

    drawCardOutline(ctx, card_width, card_height, 7, "#FFFFFF");
    ctx.fillStyle = COLOR_MAP.get(color);
    ctx.fillRect(padding, padding, card_width-2*padding, card_height-2*padding);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(padding, padding, inset_width, inset_height);
    ctx.fillRect(card_width-padding-inset_width, card_height-padding-inset_height, inset_width, inset_height);
    ctx.font = "18px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    let lineHeight = ctx.measureText('M').width;
    for (let i = 0; i != 2; i++){
        if (val !== 'T'){
            ctx.fillText(val, padding + inset_width/2, padding + inset_height/2 + lineHeight/2 - 2); 
        }
        else{
            let reduce_spacing = 4;
            let width_1 = ctx.measureText('1').width;
            let width_0 = ctx.measureText('0').width;

            ctx.fillText('1', padding + inset_width/2 - width_1/2 + reduce_spacing/2, padding + inset_height/2 + lineHeight/2 - 2); 
            ctx.fillText('0', padding + inset_width/2 + width_0/2 - reduce_spacing/2, padding + inset_height/2 + lineHeight/2 - 2);
        }
        if (val === '6' || val === '9'){
            let width = ctx.measureText(val).width;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding + inset_width/2 - width/2, padding + inset_height/2 + lineHeight/2 + 1);
            ctx.lineTo(padding + inset_width/2 + width/2, padding + inset_height/2 + lineHeight/2 + 1);
            ctx.stroke();
        }
        ctx.rotate(Math.PI);
        ctx.translate(-card_width, -card_height);
    }
}

function drawTroopCardBack(ctx){
    let card_width = 80;
    let card_height = 120;
    let padding = 7;

    drawCardOutline(ctx, card_width, card_height, 7, "#000000");
    ctx.fillStyle = "#D2B48C";
    ctx.fillRect(padding, padding, card_width-2*padding, card_height-2*padding);

    ctx.font = "16px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText('TROOP', card_width/2, card_height/2)
}

function drawCardOutline(ctx, width, height, corner_radius, fill_color){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = fill_color;
    let lineWidth = 2;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(corner_radius+lineWidth/2, lineWidth/2);
    ctx.lineTo(width-corner_radius-lineWidth/2, lineWidth/2);
    ctx.arcTo(width-lineWidth/2, lineWidth/2, width-lineWidth/2, corner_radius+lineWidth/2, corner_radius+lineWidth/2);
    ctx.lineTo(width-lineWidth/2, height-corner_radius-lineWidth/2);
    ctx.arcTo(width-lineWidth/2, height-lineWidth/2, width-corner_radius-lineWidth/2, height-lineWidth/2, corner_radius+lineWidth/2);
    ctx.lineTo(corner_radius+lineWidth/2, height-lineWidth/2);
    ctx.arcTo(lineWidth/2, height-lineWidth/2, lineWidth/2, corner_radius+lineWidth/2, corner_radius+lineWidth/2);
    ctx.lineTo(lineWidth/2, corner_radius+lineWidth/2);
    ctx.arcTo(lineWidth/2, lineWidth/2, corner_radius+lineWidth/2, lineWidth/2, corner_radius+lineWidth/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawFlag(ctx, y_offset){
    var img = document.getElementById("flag");
    ctx.drawImage(img, 15, y_offset, 50, 50);

}