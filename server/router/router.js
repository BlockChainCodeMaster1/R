
export default function router (router, handle) {
    /** api **/
    router.get("/api/getTotalData", require("../container/ieo.js").getTotalData)
    router.get("/api/getRank", require("../container/ieo.js").getRank)
    router.get("/api/getDataByAddress/:address", require("../container/ieo.js").getDataByAddress)
    router.get("/api/getFloorDataByAddress/:address", require("../container/ieo.js").getFloorDataByAddress)
    router.get("/api/getInviteDataByAddress/:address", require("../container/ieo.js").getInviteDataByAddress)
    
    router.post("/api/sendBitcoin", require("../container/ieo.js").sendBitcoin);
    
    // Default catch-all handler to allow Next.js to handle all other routes
    router.all("*", (req, res) => handle(req, res))
}