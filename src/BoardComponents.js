import React from 'react';

var COLOR_MAP = new Map([["r","#FF0000"],["o","#FFA500"],["y","#FFFF00"],["g","#008000"],["b","#0000FF"],["p","#800080"]]);
var TACTICS_FORMAT_MAP = new Map([["ALX",[["ALEXANDER"],6]],["DAR",[["DARIUS"],9]],["CAV",[["COMPANION","CAVALRY"],6]],["321",[["SHIELD","BEARERS"],8]],["TRA",[["TRAITOR"],9]],["DES",[["DESERTER"],7]],["RDP",[["REDEPLOY"],7]],["SCT",[["SCOUT"],9]],["FOG",[["FOG"],9]],["MUD",[["MUD"],9]]]);


export class Card extends React.Component {
    constructor(props) {
        super(props);
        this.cardRefs = React.createRef();
        this.height = this.props.side === 'deck' ? 120:150;
    }
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {    
        const ctx = this.cardRefs.current.getContext('2d');
        ctx.clearRect(0,0, 80, this.height);
        let translate = (this.props.side === 'top' && this.props.selected) ||  (this.props.side === 'bottom' && !this.props.selected) || this.props.side === 'deck' ? 0:30;
        ctx.translate(0,translate);
        if (this.props.str.length === 2){
            drawTroopCardFront(ctx, this.props.str, null);
        }
        else if (this.props.str.length === 3){
            drawTacticsCardFront(ctx, this.props.str, null);
        }
        else if (this.props.str === 'troop'){
            drawTroopCardBack(ctx);
        }
        else if (this.props.str === 'tactics'){
            drawTacticsCardBack(ctx);
        }
        ctx.translate(0,-translate);
    }

    render() {
         return (
             <canvas ref={this.cardRefs} width={80} height={this.height}/>
         );
    }
}

export class Formation extends React.Component {
    constructor(props) {
        super(props);
        this.formationRefs = React.createRef();
    }
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {    
        const ctx = this.formationRefs.current.getContext('2d');
        ctx.clearRect(0,0, 80, 295);
        if (this.props.side === 'top'){
            ctx.translate(0,175);
            for (let i = 0; i !== this.props.cards.length; i++){
                if (this.props.cards[i].length === 2){
                    drawTroopCardFront(ctx, this.props.cards[i], this.props.highlights[i]);
                }
                else if (this.props.cards[i].length === 3){
                    drawTacticsCardFront(ctx, this.props.cards[i], this.props.highlights[i]);
                }
                ctx.translate(0,-35);
            }
            ctx.translate(0,-35*(5-this.props.cards.length))
        }
        else{
            for (let i = 0; i !== this.props.cards.length; i++){
                if (this.props.cards[i].length === 2){
                    drawTroopCardFront(ctx, this.props.cards[i], this.props.highlights[i]);
                }
                else if (this.props.cards[i].length === 3){
                    drawTacticsCardFront(ctx, this.props.cards[i], this.props.highlights[i]);
                }
                ctx.translate(0,35);
            }
            ctx.translate(0,-35*this.props.cards.length)
        }
        if (this.props.show_flag){
            let y_offset = this.props.side === 'top' ? 35*(7-this.props.cards.length):35*this.props.cards.length;
            drawFlag(ctx, y_offset);
        }
        
    }

    render() {
         return (
             <canvas ref={this.formationRefs} width={80} height={295}/>
         );
    }   
}

export class Flag extends React.Component {
    constructor(props) {
        super(props);
        this.flagRefs = React.createRef();
    }
    componentDidMount() {
        this.updateCanvas();
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    updateCanvas() {    
        const ctx = this.flagRefs.current.getContext('2d');
        ctx.clearRect(0,0, 80, 50);
        if (this.props.show_flag){
            drawFlag(ctx, 0);
        }
    }
    render() {
         return (
             <canvas ref={this.flagRefs} width={80} height={50}/>
         );
    }   
}

function drawTroopCardFront(ctx, card_str, highlight){
    let card_width = 80;
    let card_height = 120;
    let padding = 7;
    let inset_width = 20;
    let inset_height = 25;
    let val = card_str[0];
    let color = card_str[1];

    if (highlight === null){
        highlight = "#FFFFFF";
    }
    drawCardOutline(ctx, card_width, card_height, 7, highlight);
    ctx.fillStyle = COLOR_MAP.get(color);
    ctx.fillRect(padding, padding, card_width-2*padding, card_height-2*padding);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(padding, padding, inset_width, inset_height);
    ctx.fillRect(card_width-padding-inset_width, card_height-padding-inset_height, inset_width, inset_height);
    ctx.font = "18px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    let lineHeight = ctx.measureText('M').width;
    for (let i = 0; i !== 2; i++){
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

    ctx.font = "14px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText('TROOP', card_width/2, card_height/2)
}

function drawTacticsCardFront(ctx, card_str, highlight){
    let card_width = 80;
    let card_height = 120;
    let padding = 7;
    let inset_width = 20;
    let inset_height = 25;

    if (highlight === null){
        highlight = "#FFFFFF";
    }
    drawCardOutline(ctx, card_width, card_height, 7, highlight);
    ctx.fillStyle = "#E4DB86";
    ctx.fillRect(padding, padding, card_width-2*padding, card_height-2*padding);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(padding, padding, inset_width, inset_height);
    ctx.fillRect(card_width-padding-inset_width, card_height-padding-inset_height, inset_width, inset_height);
    let format = TACTICS_FORMAT_MAP.get(card_str);
    let text = format[0];
    let font_size = format[1];
    drawIcon(card_str, ctx, card_width/2, card_height/2, 40, 40);

    for (let i = 0; i !== 2; i++){
        ctx.font = font_size.toString() + "px Verdana";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        let lineHeight = ctx.measureText('M').width;
        for (let j = 0; j !== text.length; j++){
            ctx.fillText(text[j], (card_width + inset_width)/2, (35+padding+lineHeight*text.length)/2 - lineHeight*(text.length - 1 - j));
        }
        drawIcon(card_str, ctx, padding + inset_width/2, padding + inset_height/2 - 2, 18, 18);
        ctx.rotate(Math.PI);
        ctx.translate(-card_width, -card_height);
    }
    if (format.length === 3){
        format[2]();
    }
}

function drawTacticsCardBack(ctx){
    let card_width = 80;
    let card_height = 120;
    let padding = 7;

    drawCardOutline(ctx, card_width, card_height, 7, "#855040");
    ctx.fillStyle = "#D2B48C";
    ctx.fillRect(padding, padding, card_width-2*padding, card_height-2*padding);

    ctx.font = "14px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText('TACTICS', card_width/2, card_height/2);
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

function drawIcon(card_str, ctx, x, y, width, height) {
    if (card_str === "ALX" || card_str === "DAR"){
        drawLeaderIcon(ctx, x, y, width, height);
    }
    else if (card_str === "CAV"){
        drawCompanionCavalryIcon(ctx, x, y, height);
    }
    else if (card_str === "321"){
        drawShieldBearersIcon(ctx, x, y, width, height);
    }
    else if (card_str === "TRA"){
        drawTraitorIcon(ctx, x, y, width, height);
    }
    else if (card_str === "DES"){
        drawDeserterIcon(ctx, x, y, width, height);
    }
    else if (card_str === "RDP"){
        drawRedeployIcon(ctx, x, y, width, height);
    }
    else if (card_str === "SCT"){
        drawScoutIcon(ctx, x, y, width, height);
    }
    else if (card_str === "MUD"){
        drawMudIcon(ctx, x, y, height);
    }
    else if (card_str === "FOG"){
        drawFogIcon(ctx, x, y, height);
    }
}

function drawLeaderIcon(ctx, x, y, width, height){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    let lineWidth = 1;
    ctx.lineWidth = lineWidth;
    width = 0.9*width-4;
    height = 0.9*height;
    let b1 = [x-width/3,y+height/2];
    let b2 = [x+width/3,y+height/2];
    let p1 = [x-width/2,y-height/2+2];
    let p2 = [x,y-height/2+2];
    let p3 = [x+width/2,y-height/2+2];
    let v1 = [x-width/6,y];
    let v2 = [x+width/6,y];
    ctx.beginPath();
    ctx.moveTo(b1[0], b1[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(v1[0], v1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(v2[0], v2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(b2[0], b2[1]);
    ctx.lineTo(b1[0], b1[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawCompanionCavalryIcon(ctx, x, y, height){
    ctx.font = height.toString()+"px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    let lineHeight = ctx.measureText('M').width;
    let text = "8";
    let offset = height < 30 ? 0:7;
    ctx.fillText(text, x, y + lineHeight/2 - offset);
}

function drawShieldBearersIcon(ctx, x, y, width, height){
    ctx.font = (height/2).toString()+"px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    let lineHeight = ctx.measureText('M').width;
    let text = "321";
    let offset = height < 30 ? 0:7;
    ctx.fillText(text, x, y + lineHeight/2 - offset);
}

function drawTraitorIcon(ctx, x, y, width, height){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    let lineWidth = 1;
    ctx.lineWidth = lineWidth;
    width = 0.4*width-4;
    height = 0.9*height;
    let p1 = [x-0.2*width,y-height/2+2];
    let p2 = [x+0.2*width,y-height/2+2];
    let p3 = [x+0.2*width,y+height/2-width];
    let p4 = [x+width,y+height/2-width];
    let p5 = [x,y+height/2];
    let p6 = [x-width,y+height/2-width];
    let p7 = [x-0.2*width,y+height/2-width];
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.lineTo(p5[0], p5[1]);
    ctx.lineTo(p6[0], p6[1]);
    ctx.lineTo(p7[0], p7[1]);
    ctx.fill();
    ctx.stroke();
}

function drawDeserterIcon(ctx, x, y, width, height){
    ctx.strokeStyle = "#000000";

    width = 0.7*width-4;
    height = 0.9*height;
    let lineWidth = height/5;
    ctx.lineWidth = lineWidth;
    let p1 = [x-width/2,y-height/2+2];
    let p2 = [x+width/2,y-height/2+2];
    let p3 = [x-width/2,y+height/2];
    let p4 = [x+width/2,y+height/2];

    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.moveTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.stroke();
}

function drawRedeployIcon(ctx, x, y, width, height){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    let lineWidth = 1;
    ctx.lineWidth = lineWidth;
    height = 0.4*height-4;
    width = 0.9*width-4;
    let p1 = [x-width/2,y-0.2*height];
    let p2 = [x-width/2,y+0.2*height];
    let p3 = [x+width/2-height,y+0.2*height];
    let p4 = [x+width/2-height,y+height];
    let p5 = [x+width/2,y];
    let p6 = [x+width/2-height,y-height];
    let p7 = [x+width/2-height,y-0.2*height];
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.lineTo(p4[0], p4[1]);
    ctx.lineTo(p5[0], p5[1]);
    ctx.lineTo(p6[0], p6[1]);
    ctx.lineTo(p7[0], p7[1]);
    ctx.fill();
    ctx.stroke();
}

function drawScoutIcon(ctx, x, y, width, height){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";

    width = 0.9*width-4;
    height = width*0.5;
    let lineWidth = 1;
    ctx.lineWidth = lineWidth;

    let k = (Math.pow(height/2,2)-Math.pow(width/2,2))/height;
    let r = Math.sqrt(Math.pow(width/2,2)+Math.pow(k,2));
    let alpha = Math.atan(k*2/width);

    ctx.beginPath();
    ctx.moveTo(x+width/2,y);
    ctx.arc(x, y-k, r, alpha, Math.PI-alpha, true);
    ctx.arc(x, y+k, r, Math.PI+alpha,-alpha, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x+height*0.2, y);
    ctx.arc(x, y, height*0.2, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x+height*0.5,y);
    ctx.arc(x, y, height*0.5, 0, 2 * Math.PI, false);
    ctx.stroke();
}

function drawFogIcon(ctx, x, y, height){
    ctx.font = height.toString()+"px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    let lineHeight = ctx.measureText('M').width;
    let text = "#";
    let offset = height < 30 ? 0:7;
    ctx.fillText(text, x, y + lineHeight/2 - offset);
}

function drawMudIcon(ctx, x, y, height){
    ctx.font = height.toString()+"px Verdana";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    let lineHeight = ctx.measureText('M').width;
    let text = "+";
    let offset = height < 30 ? 0:7;
    ctx.fillText(text, x, y + lineHeight/2 - offset);
}