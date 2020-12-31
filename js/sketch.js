let people = [];
let r = 20;
let maxDensity;
let field;
let infoField;
let actionButton;
let restartButton;
let isLoop = true;
let isReset = false;
let frame;

function setup() {
    frame = {count:0, rate:30, max:300}
    infoField = {w: windowWidth, h:200}
    field = {w: windowWidth, h:windowHeight-infoField.h, offset:10}
    maxDensity = field.w/(r*2) * field.h/(r*2)
    createCanvas(windowWidth, windowHeight);
    frameRate(frame.rate);
    for(var i = 0; i < maxDensity; i++){
        people.push(new Person(random(r, field.w-r), random(r, field.h-r), r));
    }
    people[0].isInfe = true;
    actionButton = createButton('pause');
    actionButton.id('actionButton');
    actionButton.position(field.w - 200, field.h + field.offset);
    actionButton.mousePressed(()=>onActionButtonPressed());
    restartButton = createButton('restart');
    restartButton.id('restartButton');
    restartButton.position(field.w - 200, field.h + field.offset * 5);
    restartButton.mousePressed(()=>onRestartButtonPressed(isReset));
}

function draw() {
    background(0);
    drawStroke(field.offset, field.offset, field.w-field.offset*2, field.h-field.offset*2);
    if (isReset){
        people = [];
        for(var i = 0; i < maxDensity; i++){
            people.push(new Person(random(r, field.w-r), random(r, field.h-r), r));
        }
        people[0].isInfe = true;
        frame.count = 0;
        isReset = !isReset;
    }
    for(let i = 0; i < people.length; i++){
        people[i].update();
        people[i].bounce(field);
        for(let j = 0; j < people.length; j++){
            if (j == i){
                continue;
            }
            let loc = people[j].location.copy();
            let distance = loc.sub(people[i].location).mag();
            if (distance < people[i].r && !people[i].isInfe && people[j].isInfe){
                people[i].isInfe = true;
            }
        }
        people[i].display();
    }
    push();
    translate(0, field.h);
    drawStroke(field.offset, 0, field.w-field.offset*2, infoField.h-field.offset)
    pop();
    if (frame.count > frame.max){
        isReset = true;
        frame.count = 0;
        noLoop();
        isLoop = false;
    }
    frame.count++;
}

function drawStroke(x, y, w, h){
    fill(0, 0)
    stroke(150)
    rect(x, y, w, h);
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

//////////////////////////////////
///////////Person Class///////////
//////////////////////////////////

class Person{
    constructor(x, y, radius){
        let location;
        let velocity;
        let acceleration;
        let r;
        let isInfe;
        let c;
        let maxspeed;
        let maxforce;

        this.acceleration = createVector(random(-1, 1), random(-1, 1));
        this.velocity = createVector(0, 0);
        this.location = createVector(x, y);
        this.r = radius;
        this.isInfe = false;
        this.c = color(255, 255, 255);
        this.maxspeed = 2;
        this.maxforce = 0.1;
    }

    update(){
        this.velocity.normalize();
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxspeed);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
        if (this.isInfe){
            this.c = color(255, 0, 0);
        }
    }

    bounce(f){
        var offset = this.r * 0.5 + f.offset;
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