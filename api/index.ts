import axios from "axios";

export const getPublicRelationshipLink = async (adress:String) => {
    try {
        const {
            data
        } = await axios.get(`/api/getPublicRelationshipLink/${adress}`)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const getPrivateRelationshipLink = async (adress:String) => {
  try {
      const {
          data
      } = await axios.get(`/api/getPrivateRelationshipLink/${adress}`)
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

export const createPrivateRelationship = async (
  from: String,
  signature: String,
  type: Number,
  range: Number
) => {
  try {
    const { data } = await axios.post(`/api/createPrivateRelationship`, {
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

export const getPublicAccountByInviteCode = async (inviteCode:String) => {
  try {
      const {
          data
      } = await axios.get(`/api/getPublicAccountByInviteCode/${inviteCode}`)
      return data
  } catch (error) {
      console.log(error)
  }
}

export const getPrivateAccountByInviteCode = async (inviteCode:String) => {
  try {
      const {
          data
      } = await axios.get(`/api/getPrivateAccountByInviteCode/${inviteCode}`)
      return data
  } catch (error) {
      console.log(error)
  }
}

export const getAndUpdateIndex = async () => {
  try {
      const {
          data
      } = await axios.get(`/api/getAndUpdateIndex`)
      return data
  } catch (error) {
      console.log(error)
  }
}

