let people = [];
let r = 22;
let maxDensity;

function setup() {
    maxDensity = windowWidth/(r*2) * windowHeight/(r*2)
    createCanvas(windowWidth, windowHeight);
    for(var i = 0; i < maxDensity; i++){
        people.push(new Person(random(r, windowWidth-r), random(r, windowHeight-r), r, false));
    }
    people[0].isInfe = true;
}

function draw() {
    background(0);

    for(let i = 0; i < people.length; i++){
        people[i].update();
        people[i].bounce();
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
}

//////////////////////////////////
///////////Person Class///////////
//////////////////////////////////

class Person{
    constructor(x, y, radius, isInfected){
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
        this.isInfe = isInfected;
        this.isInfe ? this.c = color(255, 0, 0) : this.c = color(255, 255, 255);
        this.maxspeed = 2;
        this.maxforce = 0.1;
        this.boost = 1.5;
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

    bounce(){
        var offset = this.r * 0.5;
        if((this.location.x >= windowWidth - offset) || (this.location.x <= offset)){
          this.velocity.x *= -1;
        }
        if((this.location.y >= windowHeight - offset) || (this.location.y <= offset)){
          this.velocity.y *= -1;
        }
    }

    display() {
        fill(this.c);
        noStroke();
        push();
        ellipse(this.location.x, this.location.y, this.r, this.r);
        pop();
    }
}