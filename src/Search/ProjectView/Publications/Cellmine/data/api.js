import { useEffect, useState } from "react";

import jsonData from "./data.js";

const useFetchData = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    setData([...jsonData.hits.hits.map(hit => hit._source)]);
  }, []);

  return data;
};

export default useFetchData;
