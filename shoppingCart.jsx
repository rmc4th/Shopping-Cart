const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl: ", url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// Ex 3 - write out all items with their stock number
// provide a button and use onClick={moveToCart} to move 1 item into the Shopping Cart
// use React.useState to keep track of items in the Cart.
// use React.useState to keep track of Stock items
// list out the Cart items in another column
function NavBar({ stockitems }) {
  console.log("stockitems: ", stockitems);
  const [cart, setCart] = React.useState([]);
  const [stock, setStock] = React.useState(stockitems);
  const [total, setTotal] = React.useState(0);
  const [query, setQuery] = React.useState("http://localhost:1337/products");
  const { Fragment, useState, useEffect, useReducer } = React;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/products",
    {
      data: [],
    }
  );
  const { 
    Button,
    Card,
    Accordion,
    Container,
    Row,
    Col,
    Image,
    Input } = ReactBootstrap;

    console.log(`Rendering Products ${JSON.stringify(data)}`);

    const moveToCart = e => {
    let [name, num] = e.target.innerHTML.split(":"); // innerHTML should be format name:3
    // use newStock = stock.map to find "name" and decrease number in stock by 1
    // only if instock is >=  do we move item to Cart and update stock
    let newStock = stock.map((item, index) => {
      if (item.name == name) {
        if (item.instock > 0) {
          item.instock--;
          
          let newCart = [...cart, item];
          setCart(newCart);
          console.log("a2C: ", cart);
          updateCheckOutTotal(item.cost);

        }
      }
      return item;
    });
    console.log("newZStock: ", newStock);
    setStock(newStock);

  };

  const moveToStock = e => {
    console.log("event: ", e);
    let name = e.target.innerHTML;

    //Take element out of cart
//    let cartIndex = cart.findIndex((element) => element.name == name);
    let cartIndex = e.target.id;
    let newCart = [...cart];
    if(cartIndex >= 0) {
      let splicedItem = newCart.splice(cartIndex, 1);
      console.log("c2C: ", newCart);
      setCart(newCart);
      updateCheckOutTotal(-1 * splicedItem[0].cost);
    }

    // Move element back to stock
    let newStock = stock.map((item, index) => {
      if (item.name == name) {
        item.instock++;
        console.log("b2C: ", cart);
      }
    });

  };

  const updatedList = stock.map((item, index) => {
    let imgUrl = "https://picsum.photos/id/" + (1011 + index) + "/50/50";
    let listKey = "key" + index;
    let imgKey = "image" + index;
    console.log("updated Item: ", item);
    return (
      <li key={listKey}>
        <img src={ imgUrl } key={imgKey}></img>
        <Button onClick={moveToCart} key={index}>
          {item.name}:{item.instock}
        </Button>
      </li>
    );
  });

  const updatedCart = cart.map((item, index) => {
      let cartKey = "cart" + index;
      console.log("updating: ", cart);
      return (
        <div className={ "accordionItem" }>
          <h2 className={ "accordianHeader" }>
            <Button 
              className={ "accordionButton" } 
              type={ "button" }
              data-bs-toggle={ "collapse" }
              data-bs-target={ "#collapseOne" }
              aria-expanded={ "true" } 
              aria-controls={ "collapseOne" }
              onClick={moveToStock}
              key={cartKey}
              id={index}>
                {item.name}
            </Button>
          </h2>
        </div>
      );
  });

  function updateCheckOutTotal(change) {
    let newTotal = total + change;
    console.log("newTotal: ", newTotal);
    setTotal(newTotal);
  }

  const clearCheckOut = () => {
    console.log("Checking Out...");
  }

  const restockProducts = (url) => {
    console.log("Into Restock function");
    console.log("data: ", data);
    doFetch(url);
    let newItems = data.map((item) => {
      let { name, country, cost, instock } = item;
      return { name, country, cost, instock };
    });
    console.log("oldItems: ", stock);
    console.log("newItems: ", newItems);
    let reStock = [...stock, ...newItems];
    console.log("items.ReStock: ", reStock);
    setStock([...reStock]);
  };

  // note that React needs to have a single Parent
  return (
    <div className={ "container" }>
      <div className={ "row" }>
        <div className={ "col" }>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{updatedList}</ul>
        </div>
        <div className={ "col" }>
          <h1>Shopping Cart</h1>
          <div className={ "accordion" } id={ "cartAccordion" }>{updatedCart}</div>
        </div>
        <div className={ "col" }>
          <h1>Checkout</h1>
          <Button onClick={clearCheckOut} key={"checkOut"}>
            ${total}
          </Button>
        </div>
      </div>
      <Row>
        <form
          key="form"
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input  
            type="text"
            value={query}
            key="input"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" key="submit">Re-Stock Products</button>
        </form>
      </Row>
    </div>
  );
}

const menuItems = [
  { name: "apple", instock: 2, cost: 3 },
  { name: "pineapple", instock: 3, cost: 4 },
  { name: "pear", instock: 0, cost: 2 },
  { name: "peach", instock: 3, cost: 5 },
  { name: "orange", instock: 1, cost: 1 }
];

ReactDOM.render(
  <NavBar stockitems={menuItems} />,
  document.getElementById("root")
);


