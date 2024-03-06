/**!
 * @name NitroStreams
 * @version 1.0.0
 * @description Acticvation of Nitro Streams
 * @author D4n13l3k00
 *
 * @website https://t.me/D4n13l3k00
 */

module.exports = class NitroStreams {
  uiInjectInterval = null;
  nitroInterval = null;

  showInfo() {
    BdApi.alert(
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
          src="https://discord.com/assets/ff5b4f3466b1e217ba845ce0540da563.png"
          alt=""
          style={{ width: "100%" }}
        />
        <h6
          style={{
            marginTop: "10px",
            marginBottom: "5px",
          }}
        >
          Made with ❤ by D4n13l3k00
        </h6>
      </div>
    );
  }

  load() {
    if (BdApi.loadData("NitroStreams", "loaded") !== true) {
      this.showInfo();
      BdApi.saveData("NitroStreams", "loaded", true);
    }
  }

  caption() {
    let qualitySettingsContainer = document.querySelector(
      "div[class^='qualitySettingsContainer']"
    );
    let caption = document.getElementsByClassName("NitroStreams-caption");
    if (qualitySettingsContainer !== null && caption.length === 0) {
      let _h6 = (
        <h6
          style={{
            marginTop: "10px",
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--interactive-normal)",
            lineHeight: "16px",
            textTransform: "uppercase",
            textAlign: "center",
          }}
          className="NitroStreams-caption"
        >
          Made with ❤ by D4n13l3k00
        </h6>
      );
      const output = document.createElement("div");
      BdApi.ReactDOM.render(_h6, output);
      qualitySettingsContainer.appendChild(output);
    }
  }

  setNitro() {
    BdApi.findModuleByProps("getCurrentUser").getCurrentUser().premiumType = 2;
  }

  start() {
    this.old_account_type =
      BdApi.findModuleByProps("getCurrentUser").getCurrentUser().premiumType;
    this.uiInjectInterval = setInterval(this.caption, 500);
    this.setNitro();
    this.nitroInterval = setInterval(this.setNitro, 5000);
  }

  stop() {
    clearInterval(this.uiInjectInterval);
    clearInterval(this.nitroInterval);
    BdApi.findModuleByProps("getCurrentUser").getCurrentUser().premiumType =
      this.old_account_type;
  }
};
