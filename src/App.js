import React, { useState, useEffect } from 'react';
import './App.css';
import { collegesData } from './colleges.js'


const perPage = 10;

// action types
const types = {
  start: "START",
  loaded: "LOADED"
};

// reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case types.start:
      return { ...state, loading: true };
    case types.loaded:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...action.newData],
        more: action.newData.length === perPage,
        after: state.after + action.newData.length
      };
    default:
      throw new Error("Don't understand action");
  }
};

// Creating context that can be used in App component
const MyContext = React.createContext();

function MyProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, {
    loading: false,
    more: true,
    data: [],
    after: 0
  });
  const { loading, data, after, more } = state;

  const load = () => {
    dispatch({ type: types.start });

    setTimeout(() => {
      const newData = collegesData.colleges.slice(after, after + perPage);
      dispatch({ type: types.loaded, newData });
    }, 500);
  };

  return (
    <MyContext.Provider value={{ loading, data, more, load }}>
      {children}
    </MyContext.Provider>
  );
}


function App() {

  const { data, loading, more, load } = React.useContext(MyContext);

  const loader = React.useRef(load);
  // use Ref for intersection observer API
  const observer = React.useRef(
    new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting) {
          loader.current();
        }
      },
      { threshold: 1 }
    )
  );

  // to set the element state
  const [element, setElement] = React.useState(null);

  // useEffect hook for getting reference of last element
  React.useEffect(() => {
    loader.current = load;
  }, [load]);

  // useEffect hook for loading data when scroll to bottom 
  React.useEffect(() => {
    const currentElement = element;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [element]);

  const renderRating = (value) => {
    [...Array(5).keys()].map((v, i) => {
      console.log(v)
      return (<i className="fa fa-stars" />)
    })
  }
  return (
    <div >
      <h4 style={{ marginLeft: "80px" }}>Colleges in North India</h4>
      <div className="card-container">
        {
          data.map((value, index) => {
            return (
              <div className="card" key={index}>
                <div className="img-container">
                </div>
                <div className="img-overlay">
                  {value.promoted && <div className="ribbon-promoted"></div>}
                  <div className="rectangle-3 text-light">
                    <div className="very-good">{value.rating}/5
                  <br /> <span className="small-font" style={{ fontWeight: "normal" }}>{value.rating_remarks}</span></div>
                  </div>
                  <div className="w-100 d-flex bottom">
                    <div className="btn-container d-flex ">
                      {
                        value.tags.map((v, i) => {
                          return (
                            <div className="btn" key={i}>{v}</div>
                          )
                        })
                      }
                    </div>
                    <div className="btn-container text-light">
                      <div className="college-rank"> #{value.ranking}</div>
                    </div>
                  </div>
                </div>
                <div className="details-container d-flex">
                  <div className="college-details-container">
                    <div className="d-flex college-name-container">
                      <h4 className="college-name text-dark">{value.college_name}</h4>&nbsp;&nbsp;
                    <span className="small-font">
                        {
                          [...Array(5).keys()].map(n => {
                            if(n<=value.rating-1)
                            {
                              return (
                                <span key={n}>
  
                                  &#9733;
                                </span>
                              )
                            }
                            else
                            {
                              return (
                                <span key={n} style={{opacity:0.5}}>
  
                                  &#9733;
                                </span>
                              )
                            }
                          })
                        }
                      </span>
                    </div>
                    <div className="d-flex college-name-container">
                      <span className="small-font text-dark light-bold">
                        {value.nearest_place[0]} | <span className="text-secondary">{value.nearest_place[1]}
                            stand</span>
                      </span>
                    </div>
                    <div className="d-flex college-name-container ">
                      <span className="small-font text-dark light-bold">
                        <span className="text-primary">93% Match : </span> {value.famous_nearest_places}
                      </span>
                    </div>
                    {/* <div className="flat-offer small-font">Flat Rs<span className="text-primary">2,000</span> off + upto Rs
                    <span className="text-primary">500</span> wallet! to avail... LOGIN
                </div> */}
                    <div className="flat-offer small-font">{value.offertext}
                    </div>
                  </div>
                  <div className="price-details-container">
                    <div className="d-flex-end price-text-container">
                      <span className="small-font">&#8377;<del>{value.original_fees}</del></span>
                    </div>
                    <div className="d-flex-end text-danger">
                      &#8377; {value.discounted_fees}
                      <br />
                    </div>
                    <span className="d-flex-end small-font text-secondary">{value.fees_cycle}</span>
                    <div className="d-flex-end text-primary amenties small-font">
                      {value.amenties[0]} &#8226; {value.amenties[1]}
                    </div>

                  </div>
                </div>
              </div>


            )
          })
        }
        {!loading && more && (
          <li ref={setElement} style={{ background: "transparent", listStyleType: "none" }}></li>
        )}
      </div>

    </div>
  );
}

export default () => {
  return (
    <MyProvider>
      <App />
    </MyProvider>
  );
};
