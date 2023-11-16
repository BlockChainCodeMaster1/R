
export default function router (router, handle) {
    /** api **/
    router.get("/api/getTotalData", require("../container/ieo.js").getTotalData)
    router.get("/api/getRank/:startTime/:endTime", require("../container/ieo.js").getRank)
    router.get("/api/getInviteRank/:day", require("../container/ieo.js").getInviteRank)
    router.get("/api/getLucky/:startTime/:endTime", require("../container/ieo.js").getLucky)
    router.get("/api/getDataByAddress/:address", require("../container/ieo.js").getDataByAddress)
    router.get("/api/getFloorDataByAddress/:address", require("../container/ieo.js").getFloorDataByAddress)
    router.get("/api/getInviteDataByAddress/:address", require("../container/ieo.js").getInviteDataByAddress)
    
    router.post("/api/sendBitcoin", require("../container/ieo.js").sendBitcoin);
    router.post("/api/sendBitcoins", require("../container/ieo.js").sendBitcoins);
    router.post("/api/sendBitcoinT", require("../container/ieo.js").sendBitcoinT);

    
    // Default catch-all handler to allow Next.js to handle all other routes
    router.all("*", (req, res) => handle(req, res))
}