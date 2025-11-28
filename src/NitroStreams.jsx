/**!
 * @name NitroStreams
 * @version 1.2.1
 * @description Acticvation of Nitro Streams
 * @author D4n13l3k00
 *
 * @website https://t.me/D4n13l3k00
 */

import info from "./assets/info.png?base64";

module.exports = class NitroStreams {
  nitroInterval = null;
  getCurrentUser = BdApi.Webpack.getStore("UserStore").getCurrentUser;

  showInfo() {
    BdApi.UI.alert(
      "NitroStreams",
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "500",
          color: "var(--interactive-normal)",
          lineHeight: "16px",
          textTransform: "uppercase",
          marginTop: "10px",
          marginBottom: "5px",
        }}
      >
        <img
          src={"data:image/png;base64," + info}
          alt=""
          style={{ width: "100%" }}
        />
        <h6
          style={{
            marginTop: "10px",
            marginBottom: "5px",
          }}
        >
          <br />
          Made with ❤ by D4n13l3k00 <br />
          t.me/D4n13l3k00
        </h6>
      </div>
    );
  }

  load() {
    this.showInfo();
    if (BdApi.Data.load("NitroStreams", "loaded") !== true) {
      this.showInfo();
      BdApi.Data.save("NitroStreams", "loaded", true);
    }
  }

  setNitro() {
    this.getCurrentUser().premiumType = 2;
  }

  start() {
    this.old_account_type = this.getCurrentUser().premiumType;
    this.setNitro();
    this.nitroInterval = setInterval(this.setNitro, 5000);
  }

  stop() {
    clearInterval(this.nitroInterval);
    this.getCurrentUser().premiumType = this.old_account_type;
  }
};
