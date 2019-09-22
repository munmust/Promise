import { Z_VERSION_ERROR } from "zlib";

/*
构造函数Promise必须接受一个函数作为参数，我们称该函数为handle，handle又包含resolve和reject两个参数，它们是两个函数
*/
/*
new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('FULFILLED')
    }, 1000)
  })
*/
//判断是否为函数
const isFunction=variable=>typeof variable==='function';
//promise 的三种状态
const PENDING='PENDING';
const FULFILLED='FULFILLED';
const REJECTED='REJECTED';
//Promise
class Promise{
    constructor(handle){
        //判断变量是否为函数
        if(!isFunction(handle)){
            throw new Error('Promise must accept a Function as a parameter');
        }
        //状态
        this._status=PENDING;
        //值
        this._value=undefined;
        /*
        由于 then 方法支持多次调用，我们可以维护两个数组，
        将每次 then 方法注册时的回调函数添加到数组中，等待执行
        */
        //成功的回调函数
        this._fulfilledQueues=[];
        //失败的回调函数
        this._rejectedQueues=[];
        //执行handle
        try{
            handle(this._resolve.bind(this),this._reject.bind(this))
        }catch(err){
            this._reject(err)
        }
    }
    /*
    resolve : 将Promise对象的状态从 Pending(进行中) 变为 Fulfilled(已成功)
    reject : 将Promise对象的状态从 Pending(进行中) 变为 Rejected(已失败)
    resolve 和 reject 都可以传入任意类型的值作为实参，表示 Promise 对象成功（Fulfilled）和失败（Rejected）的值
    */
   //resolve执行时的函数
   _resolve(res){
       //当状态之前就改变过之后，不会再去改变状态
       if(this._status!==PENDING) return;
       //我们依次提取成功或失败任务队列当中的函数开始执行，
       //并清空队列，从而实现 then 方法的多次调用
       const runFulfilled=(value)=>{
        let now;
        while(now=this._fulfilledQueues.shift()){
            now(value);
        }
       }
       const runRejected=(value)=>{
           let now;
           while(now=this._rejectedQueues.shift()){
               now(value)
           }
       }
        /* 当 resolve 方法传入的参数为一个 Promise 对象时，
        则该 Promise 对象状态决定当前 Promise 对象的状态
        */
       if(res instanceof Promise){
           res.then(res=>{
            //将状态改为fulfilled
            this._status===FULFILLED;
            //将值存储
            this._value===res;
            runFulfilled(res);
           },error=>{
            this._value=error;
            this.status=REJECTED;
            runRejected(error);
           })
       }else{
           this.value=res;
           this.status=REJECTED;
           runRejected(res);
       }
        // 为了支持同步的Promise，这里采用异步调用
      setTimeout(()=>run(),0);
   }

   //reject执行时的函数
   _reject(err){
       //当状态之前就改变过之后，不会再去改变状态
       if(this._status!==PENDING)return;
       const run=()=>{
       //将状态改为reject
       this._status===REJECTED;
       //将值存储
       this._value===err;
        let now;
        while(now =this._rejectedQueues.shift()){
            now(err);
        }
    }
    /* 当 resolve 方法传入的参数为一个 Promise 对象时，
        则该 Promise 对象状态决定当前 Promise 对象的状态
    */

    setTimeout(()=>run(),0);
   }
   //then方法
   /*
    如果onReject和onFulfilled不是函数，则被忽略
    onFulfilled:
        onFulfilled是一个函数：
            当promise状态改变为成功时必须被调用，第一个参数为promise成功状态传入的值（resolve执行时传入的值）
            在promise状态改变前不能被使用
            调用次数不能超过1次

    onRejected:
            当promise状态改变为失败时必须被调用，第一个参数为promise成功状态传入的值（resolve执行时传入的值）
            在promise状态改变前不能被使用
            调用次数不能超过1次
    多次调用
    then 方法可以被同一个 promise 对象调用多次
        当 promise 成功状态时，所有 onFulfilled 需按照其注册顺序依次回调
        当 promise 失败状态时，所有 onRejected 需按照其注册顺序依次回调

    返回
        promise必须返回一个新的Promise的对象
    
    promise支持链式调用
        1，当onFulfilled或onRejected返回一个值为x；则下一个的Promise的解决的过程
            (1)若x不为promise，则使x直接作为新返回的Promise对象的值，即新的onFulfilled或onRejected函数的参数
                let promise1=new Promise((resolve,reject)=>{
                    resolve(1);
                })
                promise2=promise1.then(res=>{
                    return res;
                })
                promise2.then(res=>{
                    console.log(res) //1
                })
            (2)若x为Promise，这时后一个回调函数会等待Promise 对象（x）的状态的变化，才会被调用。并且新的Promise的状态和x的状态相同
                let promise1=new Promise((resolve,reject)=>{
                    resolve(1);
                })
                promise2=promise1.then(res=>{
                    return new Promise((resolve,reject)=>{
                        resolve(2);
                    })
                })
                promise2.then(res=>{
                    console.log(res) //2
                })
        2,当onFulfilled或onRejected抛出异常e,则下一个Promise必须变为Rejected并返回失败的值e
                let promise1=new Promise((resolve,reject)=>{
                    resolve(1);
                })
                let promise2=promise1.then(res=>{
                    throw new Error(2);
                })
                promise2.then(res=>{
                    console,log(res)
                },error=>{
                    console.log(error) //2
                })
        3,如果onFulfilled不是函数且状态为Fulfilled，则下一个Promise变为Fulfilled并返回前一个的值
                let promise1=new Promise((resolve,reject)=>{
                    resolve(1);
                })
                let promise2=promise1.then();
                promise2.then(res=>{
                    console.log(res) //1
                })
        4，如果onRejected不是函数且状态为Rejected，则下一个Promise变为Rejected，并返回失败的值
                let promise1=new Promise((resolve,reject)=>{
                    reject(1);
                })
                let promise2=promise.then();
                promise2.then(res=>{
                    console.log(res)
                }，error=>{
                    console.log(error)//1
                })
   */
    then(onFulfilled,onRejected){
        //确定值和状态
        const {_value,_status}=this;
        // 返回一个新的Promise对象
        return new Promise((onFulfilledNext,onRejectedNext)=>{
            //封装一个成功时执行的函数
            let fulfilled=value=>{
                try{
                    //如果不是函数
                    if(!isFunction(onFulfilled)){
                        onFulfilled(value);
                    }
                    //是函数
                    else{
                        let res=onFulfilledNext(value);
                        if(res instanceof Promise){
                            //如果当前的回调函数是Promise对象，必须等待它的状态发生改变后执行下一个回调
                            res.then(onFulfilledNext,onRejectedNext);
                        }
                        //如果不是，则返回的参数直接作为参数，传入下一个then函数，并且立即执行then的回调函数
                        else{
                            onFulfilled(res);
                        }
                    }
                }catch(error){
                    onRejectedNext(error)
                }
            }
            //封装一个失败时执行的函数
            let reject=error=>{
                try{
                    //如果不是函数
                    if(!isFunction(onRejected)){
                        onRejectedNext(error);
                    }
                    //是函数
                    else{
                        let res=onRejected(error);
                        // 如果当前回调函数返回Promise对象，必须等待其状态改变后在执行下一个回调
                        if(res instanceof Promise){
                            res.then(onFulfilledNext,onRejectedNext);
                        }else{
                            //返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                            onFulfilledNext(res);
                        }
                    }
                }catch(error){
                    onRejected(error);
                }
            }
            switch (_status) {
                //当状态为pending时，将then方法回调函数加入执行队列等待执行
                case PENDING:
                    this._fulfilledQueues.push(onFulfilled);
                    this._rejectedQueues.push(onRejected);
                    break;
                    // 当状态已经改变时，立即执行对应的回调函数
                case FULFILLED:
                    onFulfilled(_value);
                    break;
                case REJECTED:
                    onRejected(_value)
                    break;
            }
        })
    }
    catch(){
        return this.then(undefined,onRejected);
    }
    static resolve(value){
        // 如果参数是MyPromise实例，直接返回这个实例
        if(value instanceof Promise) return value;
        return new Promise(resolve=>resolve(value));
    }
    static reject(error){
        return new Promise((resolve,reject)=>reject(error));
    }
    static all(arr){
        return new Promise((resolve,reject)=>{
            //返回值的集合
            let values=[];
            //计数
            counts=0;
            for(let [i,p] of arr.entries()){
                // 数组参数如果不是Promise实例，先调用Promise.resolve
                this.resolve(p).then(res=>{
                    values[i]=res;
                    count++;
                    // 所有状态都变成fulfilled时返回的MyPromise状态就变成fulfilled
                    if(counts===arr.length) resolve(values);
                },error=>{
                    //有一个被rejected时返回的MyPromise状态就变成rejected
                    reject(error)
                })
            }
        })
    }
    static race(arr){
        return new Promise((resolve,reject)=>{
            for(let p of arr){
                this.resolve(p).then(res=>{
                    resolve(res);
                },error=>{
                    reject(error);
                })
            }
        })
    }
}