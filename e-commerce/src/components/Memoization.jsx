/* import React, { useCallback, useEffect, useState } from "react";

const Memoization = () => {
  return (
    <div>
      <h1 className="text-center text-3xl">Memoization</h1>
      <Parent />
    </div>
  );
};

export default Memoization;
 */
/* const Parent = () => {
  const [pNum, setPnum] = useState(100);
  useEffect(() => {
    console.log("parent re-rendered pNum:", pNum);
  });
  return (
    <div className="text-center">
      <h1 className="text-3xl">Pnum : {pNum}</h1>
      <button
        className="btn btn-primary"
        onClick={() => setPnum((prev) => prev + 1)}
      >
        pNum++
      </button>
      <Child />
    </div>
  );
};

// component memoization
const Child = React.memo(() => {
  useEffect(() => {
    console.log("child re-rendered");
  });
  return <div className="text-center">Child Component</div>;
});
 */

import { useMemo, useState } from "react";

/* const Parent = () => {
  const [pNum, setPnum] = useState(100);
  useEffect(() => {
    console.log("parent re-rendered pNum:", pNum);
  });
  return (
    <div className="text-center">
      <h1 className="text-3xl">Pnum : {pNum}</h1>
      <button
        className="btn btn-primary"
        onClick={() => setPnum((prev) => prev + 1)}
      >
        pNum++
      </button>
      <Child pNum={pNum}/>
    </div>
  );
};

// component memoization
// const Child = React.memo(() => {
const Child = React.memo(({pNum}) => {
  useEffect(() => {
    console.log("child re-rendered pNum:",pNum);
  });
  return <div className="text-center">Child Component</div>;
}); */

/* const Parent = () => {
  const [pNum, setPnum] = useState(100);
  // function references recreates every time when a component is re-rendered
  //   const showPNum = () => {
  //     console.log("The value of PNum is ");
  //   };
  const showPNum = useCallback(() => {
    console.log("The value of PNum is ", pNum);
  }, [pNum]);
  useEffect(() => {
    console.log("parent re-rendered pNum:", pNum);
  });
  return (
    <div className="text-center">
      <h1 className="text-3xl">Pnum : {pNum}</h1>
      <button
        className="btn btn-primary"
        onClick={() => setPnum((prev) => prev + 1)}
      >
        pNum++
      </button>
      <Child showPNum={showPNum} />
    </div>
  );
}; */
/* const Child = React.memo(({ showPNum }) => {
  useEffect(() => {
    console.log("child re-rendered");
    showPNum();
  });
  return <div className="text-center">Child Component</div>;
}); */

// useMemo Hook

const Memoization = () => {
  // 1-10 = 55 -> last value

  const [num, setNum] = useState(0);
  const heavyCalculation = (num) => {
    console.log("Performing Heavy Calculation!");
    let sum = 0;
    for (let i = 0; i < 10e8; i++) {
      sum += i;
    }
    sum = sum + num;
    return sum;
  };

  const finalValue = useMemo(() => heavyCalculation(num), [num]); // useMemo will only recompute the memoized value when one of the deps has changed.

  return (
    <div className="text-3xl text-center">
      <h1>Memoization {finalValue}</h1>
      <button className="btn btn-primary" onClick={() => setNum(num + 1)}>
        num++
      </button>
      <button className="btn btn-primary ml-2" onClick={() => setNum(5)}>
        set num to 5
      </button>
    </div>
  );
};

export default Memoization;
