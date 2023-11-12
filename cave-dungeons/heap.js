/**
 * Heap implementation, based on Durr and Vie (2021)
 */
class Heap {
    constructor(items, compareFn) {
      this.heap = [0];
      this.rank = [];
      this.compareFn = compareFn;
      for(let x of items) {
        this.push(x);
      }
    }
  
    push(x) {
      let i = this.heap.length;
      this.heap.push(x);
      this.up(i);
      // console.log("PUSH");
      // console.log(x);
      // this.print();
    }
  
    pop() {
      let root = this.heap[1]
      let x = this.heap.pop();
      if (this.heap.length > 1) {
        this.heap[1] = x;
        this.down(1);
      }
      // console.log("POP");
      // console.log(x);
      // this.print();
      return root;
    } 
  
    up(i) {
      let x = this.heap[i]
      while(i > 1 && this.compareFn(x, this.heap[Math.floor(i/2)]) < 0) {
        this.heap[i] = this.heap[Math.floor(i/2)];
        i = Math.floor(i/2);
      }
      this.heap[i] = x;
    }
  
    down(i) {
      let x = this.heap[i];
      let n = this.heap.length;
      while(true) {
        let left = 2 * i;
        let right = left + 1;
        if(right < n && this.compareFn(this.heap[right], x) < 0 && this.compareFn(this.heap[right], this.heap[left]) < 0) {
          this.heap[i] = this.heap[right]
          i = right;
        }
        else if(left < n && this.compareFn(this.heap[left], x) < 0) {
          this.heap[i] = this.heap[left];
          i = left;
        }
        else {
          this.heap[i] = x;
          return;
        }
      }
    }
  
    print() {
      console.log("Priority queue number of elements: ".concat(this.heap.length - 1));
      for(let i of this.heap) {
        console.log(i);
      }
      console.log(" -- ");
    }
  }