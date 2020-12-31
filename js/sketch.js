////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////Auguments//////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

let people = [];
let locs = [];
let r = 20;
let density = 200;
let maxDensity = 500;
let field;
let infoField;
let actionButton;
let restartButton;
let isLoop = true;
let isReset = false;
let frame = {
    count:0,
    rate:30,
    max:300
};
let params = {
    InfectionRate: 50, //感染率
    CaseFatalityRate: 100, //致死率
    MoveRate: 100, //移動率
    IncubationFrame: 150, //潜伏期間
    OnsetFrame: 300 //発症期間
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////Main Functions///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function setup() {
    setupData();
    createCanvas(windowWidth, windowHeight);
    frameRate(frame.rate);
    initPeople();
    setButtons(actionButton, restartButton);
}

function draw() {
    background(0);
    drawStroke(field.offset, field.offset, field.w-field.offset*2, field.h-field.offset*2);
    push();
    translate(0, field.h);
    drawStroke(field.offset, 0, field.w-field.offset*2, infoField.h-field.offset)
    pop();

    if (isReset){
        initPeople();
        frame.count = 0;
        isReset = !isReset;
    }
    for(let i = 0; i < people.length; i++){
        people[i].update();
        for(let j = 0; j < people.length; j++){
            if (j == i){
                continue;
            }
            let loc = people[j].location.copy();
            let distance = loc.sub(people[i].location).mag();
            if (distance <= people[i].r){
                people[i].velocity.mult(-1);
                if (!people[i].status.isInfection && people[j].status.isInfection
                    && getRate(people[i].params.InfectionRate)){
                    people[i].status.isInfection = true;
                }
                break;
            }
        }
        people[i].bounce(field);
        people[i].display();
    }
    if (frame.count > frame.max){
        isReset = true;
        frame.count = 0;
        noLoop();
        isLoop = false;
    }
    frame.count++;
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////Util Functions///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function setupData(){
    infoField = {w: windowWidth, h:200}
    field = {w: windowWidth, h:windowHeight-infoField.h, offset:10}
}

function initPeople(){
    // 重ならないようにrandomに配置する
    people = [];
    locs = [];
    let isOk = true;
    for(let i = 0; i < density; i++){
        let loc = createVector(
            random(field.offset + r, field.w - r),random(field.offset + r, field.h - r)
        );
        for (let j = 0; j < locs.length; j++){
            let tmp = loc.copy();
            if (tmp.sub(locs[j]).mag() <= r*1.5){
                isOk = false;
                break;
            }
        }
        if (isOk){
            locs.push(loc);
        }else{
            isOk = true;
            i--;
        }
    }
    for(let i = 0; i < locs.length; i++){
        people.push(new Person(locs[i].x, locs[i].y, r));
    }
    people[0].status.isInfection = true;
    for(let i = 0; i < people.length; i++){
        people[i].setParams(params);
    }
}

function drawStroke(x, y, w, h){
    fill(0, 0)
    stroke(150)
    rect(x, y, w, h);
}

function getRate(percentage){
    let p = Math.random() * 100;
    return (p < percentage);
}

function setButtons(actionButton, restartButton){
    actionButton = createButton('pause');
    actionButton.id('actionButton');
    actionButton.position(field.w - 200, field.h + field.offset);
    actionButton.mousePressed(()=>onActionButtonPressed());
    restartButton = createButton('restart');
    restartButton.id('restartButton');
    restartButton.position(field.w - 200, field.h + field.offset * 5);
    restartButton.mousePressed(()=>onRestartButtonPressed(isReset));
}

function onActionButtonPressed(){
    if (isReset)return;
    isLoop = !isLoop;
    isLoop ? loop() : noLoop();
    let b = document.querySelector('#actionButton');
    let rb = document.querySelector('#restartButton');
    isLoop ? b.innerText = "pause": b.innerText="start"
    isLoop ? rb.style.display = "block": rb.style.display="none"
}

function onRestartButtonPressed(){
    isLoop = true;
    loop();
    isReset = !isReset;
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////Person Class////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

class Person{
    constructor(x, y, radius){
        let location;
        let velocity;
        let acceleration;
        let r;
        let status;
        let c;
        let maxspeed;
        let params;

        this.acceleration = createVector(random(-1, 1), random(-1, 1));
        this.velocity = createVector(0, 0);
        this.location = createVector(x, y);
        this.r = radius;
        this.status = {
            isInfection: false
        }
        this.c = color(255, 255, 255);
        this.maxspeed = 2;
        this.params = {
            InfectionRate: 100,
            CaseFatalityRate: 100,
            MoveRate: 100,
            IncubationFrame: 150,
            OnsetFrame: 300
        };
    }

    setParams(p){
        this.params = p;
    }

    update(){
        this.velocity.normalize();
        this.velocity.add(this.acceleration).mult(2);
        this.velocity.limit(this.maxspeed);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
        if (this.status.isInfection){
            this.c = color(255, 0, 0);
        }
    }

    bounce(f){
        var offset = f.offset + this.r * 0.5;
        if((this.location.x >= f.w - offset) || (this.location.x <= offset)){
          this.velocity.x *= -1;
        }
        if((this.location.y >= f.h - offset) || (this.location.y <= offset)){
          this.velocity.y *= -1;
        }
    }

    display() {
        fill(this.c);
        noStroke();
        ellipse(this.location.x, this.location.y, this.r, this.r);
    }
}