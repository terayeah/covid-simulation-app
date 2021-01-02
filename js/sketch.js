////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////Auguments//////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

let people = [];
let count = {
    notInfectedPeople: 0,
    infectedPeople: 0,
    deadPeople: 0
}
let locs = [];
let r = 20;
let field;
let infoField;
let actionButton;
let restartButton;
let isLoop = true;
let isReset = false;
let frame = {
    count:0,
    rate:30,
    max:1000
};
let params = {
    density: 200,
    InfectionRate: 50, //感染率
    CaseFatalityRate: 50, //致死率
    MoveRate: 80, //移動率
    IncubationFrame: 150, //潜伏期間
    IncubationFrameCopy: 150,
    OnsetFrame: 300, //発症期間
    OnsetFrameCopy: 300
}
let Sliders = {
    densitySlider: {},
    InfectionRateSlider: {},
    CaseFatalityRateSlider: {},
    MoveRateSlider: {},
    IncubationFrameSlider: {},
    OnsetFrameSlider: {}
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
    createSliders();
}

function draw() {
    background(0);
    drawStroke(field.offset, field.offset, field.w-field.offset*2, field.h-field.offset*2);
    push();
    translate(0, field.h);
    drawStroke(field.offset, 0, field.w-field.offset*2, infoField.h-field.offset);
    pop();
    setText();
    getSliderVal();

    if (isReset){
        initPeople();
        frame.count = 0;
        isReset = !isReset;
    }
    for(let i = 0; i < people.length; i++){
        people[i].update();
        people[i].bounce(field);
        people[i].updateFlag(params.IncubationFrameCopy, params.OnsetFrameCopy, calcCount);
        for(let j = 0; j < people.length; j++){
            if (j == i){
                continue;
            }
            let loc = people[j].location.copy();
            let distance = loc.sub(people[i].location).mag();
            if (distance <= people[i].r * 1.1){
                people[i].velocity.mult(-1);
                people[i].contact(people[j].flag.isInfection, calcCount);
                break;
            }
        }
        people[i].display();
    }
    frame.count++;
    if (frame.count > frame.max){
        isReset = true;
        frame.count = 0;
        noLoop();
        isLoop = false;
    }
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////Util Functions///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function setupData(){
    infoField = {w: windowWidth, h:200}
    field = {w: windowWidth, h:windowHeight-infoField.h, offset:10}
    textAlign(RIGHT);
}

function createSliders(){
    let dist = 190;
    let offset = 50;
    let hoffset = 90;
    Sliders.densitySlider = createSlider(0, 500, params.density);
    Sliders.densitySlider.position(offset, field.h + hoffset);
    Sliders.densitySlider.style('width', '120px');
    Sliders.InfectionRateSlider = createSlider(0, 100, params.InfectionRate);
    Sliders.InfectionRateSlider.position(dist + offset, field.h + hoffset);
    Sliders.InfectionRateSlider.style('width', '120px');
    Sliders.CaseFatalityRateSlider = createSlider(0, 100, params.CaseFatalityRate);
    Sliders.CaseFatalityRateSlider.position(dist*2 + offset, field.h + hoffset);
    Sliders.CaseFatalityRateSlider.style('width', '120px');
    Sliders.MoveRateSlider = createSlider(0, 100, params.MoveRate);
    Sliders.MoveRateSlider.position(dist*3 + offset, field.h + hoffset);
    Sliders.MoveRateSlider.style('width', '120px');
    Sliders.IncubationFrameSlider = createSlider(0, frame.max, params.IncubationFrame);
    Sliders.IncubationFrameSlider.position(dist*4 + offset, field.h + hoffset);
    Sliders.IncubationFrameSlider.style('width', '120px');
    Sliders.OnsetFrameSlider = createSlider(0, frame.max, params.OnsetFrame);
    Sliders.OnsetFrameSlider.position(dist*5 + offset, field.h + hoffset);
    Sliders.OnsetFrameSlider.style('width', '120px');
}

function getSliderVal(){
    params.density = Sliders.densitySlider.value();
    params.InfectionRate = Sliders.InfectionRateSlider.value();
    params.CaseFatalityRate = Sliders.CaseFatalityRateSlider.value();
    params.MoveRate = Sliders.MoveRateSlider.value();
    params.IncubationFrame = Sliders.IncubationFrameSlider.value();
    params.OnsetFrame = Sliders.OnsetFrameSlider.value();
}

function setText(){
    push();
    translate(infoField.w - 40, field.h + infoField.h - 40);
    noStroke();
    fill(255)
    textSize(13);
    text(`not infected: ${count.notInfectedPeople} ${getPerc(count.notInfectedPeople, people.length)}%`, 0, -90);
    text(`infected: ${count.infectedPeople} ${getPerc(count.infectedPeople, people.length)}%`, 0, -65);
    text(`dead: ${count.deadPeople} ${getPerc(count.deadPeople, people.length)}%`, 0, -40);
    textSize(15);
    text(`${frame.count}/${frame.max}`, 0, 0);
    pop();
    push();
    translate(50, field.h + 80);
    noStroke();
    fill(255)
    textSize(15);
    let dist = 190;
    text(`density`, 60, -10);
    text(`${params.density}/500`, 120, 60);
    text(`infectionRate`, dist + 100, -10);
    text(`${params.InfectionRate}/100`, dist + 120, 60);
    text(`CaseFatalityRate`, dist*2 + 120, -10);
    text(`${params.CaseFatalityRate}/100`, dist*2 + 120, 60);
    text(`MoveRate`, dist*3 + 80, -10);
    text(`${params.MoveRate}/100`, dist*3 + 120, 60);
    text(`IncubationFrame`, dist*4 + 120, -10);
    text(`${params.IncubationFrame}/${frame.max}`, dist*4 + 120, 60);
    text(`OnsetFrame`, dist*5 + 90, -10);
    text(`${params.OnsetFrame}/${frame.max}`, dist*5 + 120, 60);
    pop();
}

function initPeople(){
    params.IncubationFrameCopy = params.IncubationFrame;
    params.OnsetFrameCopy= params.OnsetFrame;
    // 重ならないようにrandomに配置する
    people = [];
    count.notInfectedPeople = params.density;
    count.infectedPeople = 0;
    count.deadPeople = 0;
    locs = [];
    let isOk = true;
    for(let i = 0; i < params.density; i++){
        let loc = createVector(
            random(field.offset + r*2, field.w - r*2),random(field.offset + r*2, field.h - r*2)
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
        people.push(new Person(locs[i].x, locs[i].y, r, params.MoveRate));
    }
    people[0].infect(params.IncubationFrame);
    calcCount(-1, 1, 0);
    for(let i = 0; i < people.length; i++){
        people[i].setParams(params);
    }
}

function calcCount(nInfe, infe, dead){
    count.notInfectedPeople += nInfe;
    count.infectedPeople += infe;
    count.deadPeople += dead;
}

function getPerc(child, parent){
    return Math.round(child / parent * 100 * 10) / 10;
}

function drawStroke(x, y, w, h){
    strokeWeight(3);
    fill(0, 0)
    stroke(150)
    rect(x, y, w, h);
}

function setButtons(actionButton, restartButton){
    actionButton = createButton('pause');
    actionButton.id('actionButton');
    actionButton.position(field.w - 280, field.h + field.offset * 6);
    actionButton.mousePressed(()=>onActionButtonPressed());
    restartButton = createButton('restart');
    restartButton.id('restartButton');
    restartButton.position(field.w - 280, field.h + field.offset * 12);
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
    constructor(x, y, radius, moveRate){
        let location;
        let velocity;
        let acceleration;
        let r;
        let colors;
        let c;
        let sc;
        let maxspeed;
        let params;
        let f;
        let flag;

        this.acceleration = createVector(random(-1, 1), random(-1, 1));
        this.velocity = createVector(0, 0);
        this.location = createVector(x, y);
        this.r = radius;
        this.colors = {
            normal: color(255, 255, 255),
            incubation: color(255, 0, 0),
            infect: color(255, 0, 0),
            anti: color(0, 0, 255),
            dead: color(70, 70, 70)
        }
        this.c = this.colors.normal;
        this.sc = this.colors.normal;
        this.maxspeed = 2;
        this.params = {
            InfectionRate: 100,
            CaseFatalityRate: 100,
            MoveRate: 100,
            IncubationFrame: 150,
            OnsetFrame: 300
        };
        this.f = 0;
        this.flag = {
            isStop: !this.getRate(moveRate),
            isInfection: false,
            isDead: false,
            isAntiBody: false
        }
    }

    setParams(p){
        this.params = p;
    }

    setColor(c, sc){
        this.c = c;
        this.sc = sc;
    }

    contact(other, calcCount){
        if (!this.flag.isAntiBody && !this.flag.isInfection && other && this.getRate(this.params.InfectionRate)){
            this.flag.isInfection = true;
            calcCount(-1, 1, 0);
        }
    }

    getRate(percentage){
        let p = Math.random() * 100;
        return (p < percentage);
    }

    infect(incuEnd){
        this.flag.isInfection = true;
        this.f = incuEnd;
    }

    update(){
        if (this.flag.isDead || this.flag.isStop){
            this.velocity.mult(0);
            return;
        }
        this.velocity.normalize();
        this.velocity.add(this.acceleration).mult(2);
        this.velocity.limit(this.maxspeed);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
    }

    updateFlag(incuEnd, deadLine, calcCount){
        if (this.flag.isDead || !this.flag.isInfection) return;
        this.f++;
        // 潜伏
        this.setColor(this.colors.normal, this.colors.incubation)
        if (this.f > incuEnd){
            // 感染
            this.setColor(this.colors.infect, this.colors.infect)
        }
        if (this.f > deadLine){
            if (this.getRate(this.params.CaseFatalityRate)){
                // 死
                this.setColor(this.colors.dead, this.colors.dead)
                this.flag.isDead = true;
                calcCount(0, -1, 1);
            }else{
                // 復活
                this.setColor(this.colors.normal, this.colors.anti)
                this.flag.isAntiBody = true;
                calcCount(1, -1, 0);
            }
            this.flag.isInfection = false;
        }
    }

    bounce(f){
        var offset = (f.offset + this.r * 0.5) * 1.1;
        if(this.location.x >= f.w - offset){
            this.location.x -= 1;
            this.velocity.x *= -1;
        }else if (this.location.x <= offset){
            this.location.x += 1;
            this.velocity.x *= -1;
        }
        if(this.location.y >= f.h - offset){
            this.location.y -= 1;
            this.velocity.y *= -1;
        }else if (this.location.y <= offset){
            this.location.y += 1;
            this.velocity.y *= -1;
        }
    }

    display() {
        strokeWeight(3);
        fill(this.c);
        stroke(this.sc);
        ellipse(this.location.x, this.location.y, this.r, this.r);
    }
}