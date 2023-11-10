import axios from "axios";

export const getTotalData = async () => {
    try {
        const {
            data
        } = await axios.get(`/api/getTotalData`)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const getRank = async (date: String) => {
  try {
      const {
          data
      } = await axios.get(`/api/getRank/`+date)
      return data
  } catch (error) {
      console.log(error)
  }
}

export const createPublicRelationship = async (
  from: String,
  signature: String,
  type: Number,
  range: Number
) => {
  try {
    const { data } = await axios.post(`/api/createPublicRelationship`, {
      from: from,
      signature: signature,
      type: type,
      range: range
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

