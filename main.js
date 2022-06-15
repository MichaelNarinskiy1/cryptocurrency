(function () {
  // Global variables=======================
  let coinsArray = [];
  let selectedCoinArr = [];
  let coinsMap = new Map();
  let toggleIndex;
  let IntervalId;
  let updateSelected;

  $(function () {
    // Sidebar toggle=======================================
    $("#sidebarCollapse").on("click", function () {
      $("#sidebar, #content").toggleClass("active");
    });

    // AJAX request on page loading======================
    loadingHomePage();
    function loadingHomePage() {
      $(function () {
        $("#page-loader-animation").show();
        $.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=ils")
          .then(function (response) {
            $("#page-loader-animation").hide();
            coinsArray = response;
            onLoadPage();
            searchByFirstLetter();
            clearTogglesUI();
            clearSearchUI();
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }

    // Loading all page functions when you load / refresh page============
    function onLoadPage() {
      for (let i = 0; i < coinsArray.length; i++) {
        apppendCard(coinsArray[i]);
        onMoreinfoClicked(coinsArray[i].id);
        checkBox(coinsArray[i]);
      }
    }

    // Clear all selected toggles buttons================================
    function clearTogglesUI() {
      $(".clear-selected-modal").click(() => {
        $(`input`).prop("checked", false);
        coinsArray = [];
        selectedCoinArr = [];
        $("#selectedCoins").html("");
        localStorage.clear();
        $("#modal-body").empty();
        $("#myModal").hide();
      });
    }

    // Clear search input==========================================
    function clearSearchUI() {
      $("#clear-search").click(() => {
        $("#search-input").val("");
        $(".col-sm-4").show();
      });
    }

    //Showing and hiding elements===============================
    $("#home").click(function () {
      clearInterval(IntervalId);
      $("#about-div").hide();
      $("#chartContainer").hide();
      $(".search-div").show();
      $(".col-sm-4").append().fadeIn("slow");
      $("#clear-selected").show();
      $(".selectedCoinUI").show();
    });

    $("#about").click(function () {
      clearInterval(IntervalId);
      $(".col-sm-4").hide();
      $("#chartContainer").hide();
      $("#about-div").hide().append().fadeIn("slow");
      $("#about-div").empty();
      $(".search-div").hide();
      $(".selectedCoinUI").hide();
      $("#clear-selected").hide();
      appendAbout();
    });

    $("#live-report").click(function () {
      clearInterval(IntervalId);
      $(".selectedCoinUI").hide();
      $(".col-sm-4").hide();
      $("#about-div").hide();
      $("#chartContainer").show();
      $("#chartContainer").hide().append().fadeIn("slow");
      $(".search-div").hide();
      $("#clear-selected").hide();
      showLiveReport();
    });

    // Block the user from using symbols like:(!/^[A-Z0-9]+$/)============
    function blockSymbolsUI() {
      $("#search-input").on("keypress", function (e) {
        var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!/^[A-Z0-9]+$/i.test(key)) {
          event.preventDefault();
        }
      });
    }

    // Function that letting you to search coins by first letter you typed on field.========================================
    function searchByFirstLetter() {
      clearInterval(IntervalId);
      $("#search-input").on("keyup", function () {
        let value = $("#search-input").val().toUpperCase();

        $(".col-sm-4").each(function () {
          let card = $(this).attr("id").toUpperCase();
          let symbol = $(this).attr("class").toUpperCase();

          if (card.includes(value) || symbol.includes(value)) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      });
      blockSymbolsUI();
    }

    // Checkbox toggles function=================================
    function checkBox(card) {
      $(`#${card.symbol}`).on("click", function () {
        toggleIndex = card.symbol.replace("check", "");

        if ($(this).prop("checked") == true) {
          if (selectedCoinArr.length < 5) {
            selectedCoinArr.push(toggleIndex);
            saveSelectedToggles();
            console.log(selectedCoinArr);
          } else {
            $(this).prop("checked", false);
            appendModal();
            $("#myModal").hide().append().fadeIn("slow");
          }
        } else {
          selectedCoinArr.splice(selectedCoinArr.indexOf(toggleIndex), 1);
          saveSelectedToggles();
          console.log(selectedCoinArr);
        }
      });
      loadSelectedToggles();
    }

    // Save the selected toggles================================
    function saveSelectedToggles() {
      localStorage.setItem("SelectedCoins", JSON.stringify(selectedCoinArr));
      updateSelected = "";
      for (let i = 0; i < selectedCoinArr.length; i++) {
        if (i == selectedCoinArr.length - 1) {
          updateSelected += selectedCoinArr[i].toUpperCase();
        } else {
          updateSelected += selectedCoinArr[i].toUpperCase() + ", ";
        }
      }
      $("#selectedCoins").html(updateSelected);
    }

    function loadSelectedToggles() {
      let selectedCoins = JSON.parse(localStorage.getItem("SelectedCoins"));
      saveSelectedToggles();
      if (!selectedCoins) {
        return;
      }
      for (let i = 0; i < selectedCoins.length; i++) {
        if ($(`#${selectedCoins[i]}`).prop("checked", true)) {
          selectedCoinArr = selectedCoins;
        }
      }
    }

    // Creating the Modal body======================
    function appendModal() {
      for (let i = 0; i < selectedCoinArr.length; i++) {
        $("#modal-body").append(
          `<div class="col-sm-4">
            <div class="card cardModal">
              <div class="card-body">
                <label class="modal-switch">
                  <input type="checkbox" class="checkboxes" id="chosenToggle${
                    selectedCoinArr[i]
                  }" /> <span class="slider round modalSlider"></span>
                </label>
                <h6 class="card-title-modal">${selectedCoinArr[
                  i
                ].toUpperCase()}</h6>
              </div>
            </div>
          </div> `
        );
      }
      onClickKeepCurrentToggles();
    }

    // Keep the current Toggles and exit from modal without changes=====
    function onClickKeepCurrentToggles() {
      for (let i = 0; i < selectedCoinArr.length; i++) {
        $(`#chosenToggle${selectedCoinArr[i]}`).prop("checked", true);
        $(`#keepcurrent`).on("click", () => {
          $("#modal-body").empty();
          $("#myModal").hide();
        });
      }
      onChangeTogglesCoins();
    }

    // Replacing 1 toggle  with switching to another toggle from the 5 toggles
    function onChangeTogglesCoins() {
      for (let i = 0; i < selectedCoinArr.length; i++) {
        $(`#chosenToggle${selectedCoinArr[i]}`).on("click", () => {
          console.log(selectedCoinArr[i]);
          $("#myModal").modal("hide");
          $(`#${selectedCoinArr[i]}`).prop("checked", false);
          $(`#${toggleIndex}`).prop("checked", true);
          selectedCoinArr.splice(
            selectedCoinArr.indexOf(selectedCoinArr[i]),
            1
          );
          $("#myModal").hide();
          saveSelectedToggles();
          selectedCoinArr.push(toggleIndex);
          saveSelectedToggles();
          toggleIndex = "";
          $("#modal-body").empty();
        });
      }
    }

    // Create card===================================================
    function apppendCard(card) {
      $("#maincontainer").append(
        `<div class="${card.id} col-sm-4" id="${card.symbol.toUpperCase()}">
            <div class="card bg-transparent">
              <div class="card-body">
                <label class="switch">
                  <input type="checkbox" class="checkboxes" id="${
                    card.symbol
                  }" />
                  <span class="slider round"></span>
                </label>
                <h5 id="${card.symbol.toUpperCase()}" class="card-title">${card.symbol.toUpperCase()}</h5>
                <p class="card-name">${card.name}</p>
                <button
                  class="btn moreInfo"
                  id="infoBtn${card.id}"
                  type="button"
                  data-toggle="collapse"
                  data-target="#open${card.id}"
                  aria-expanded="false"
                  aria-controls="collapseExample">
                  more info<i class="fas fa-chart-bar"></i>
                </button>
                <div class="collapse" id="open${card.id}">
                  <div class="card card-body" id="${card.id}">
                    <div class="d-flex loader justify-content-center">
                      <div class="spinner-border text-light" role="status"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> `
      );
    }
  });

  //About======================================
  function appendAbout() {
    $("#about-div").append(
      `<div class="c-about">
        <div id="wrapper">
          <div id="about-me-div">
          </div>
          <div>
      <h1 class="text-about about-font-size">Crypto Currency App</h1>
         <div class="text-center">
             <p><h3 class="app_info">Building Crypto Currency App using the real Api.</h3><br>
                -- In this app, you can get the actual list of all crypto coins,<br>
                -- Search for coins you want,<br>
                -- To chose up to 5 coins to display them in live report.<br></p>

             <h2 class="profile_info">About me:</h2><br>
             <img src="img/profile.jpeg" alt="profile_pic" class="profile_pic">
                <p>I am Michael , student in FullStack Web Development class in John Bryce.</p><br>
                Contact me:<br>
                <i class="fas fa-phone"></i> +972 53 221 9634<br>
                <i class="fas fa-at"></i> n.mihaelhaim@gmail.com</p>
            </div>
            <div class="d-flex justify-content-center flex-wrap">

      </div>
          </div>
        </div>
      </div>`
    );
  }

  // Second request==========================================
  function requestFromAjax(coinId) {
    $("#page-loader-animation").hide();
    $.get(`https://api.coingecko.com/api/v3/coins/${coinId}`)
      .then(function (coin) {
        $(".card-loader-animation").show();
        saveMoreInfoInMap(coin, coinId);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function saveMoreInfoInMap(coin, coinId) {
    let img = coin.image.small;
    let ils = coin.market_data.current_price.ils;
    let eur = coin.market_data.current_price.eur;
    let usd = coin.market_data.current_price.usd;
    let coinObj = { img, ils, eur, usd };
    addCoinMoreInfoToUI(coinId, coinObj);
    removeMoreInfo(coinId, coinObj, coin);
  }

  // Add coin more info to UI=============================
  function addCoinMoreInfoToUI(coinId, coin) {
    $(".card-loader-animation").hide();
    $(`#${coinId}`).html(`<div><img src=${coin.img}/></div><br>
           <div>USD : ${coin.usd} <i class="fas fa-dollar-sign dollar"></i></div>
           <div>EUR : ${coin.eur} <i class="fas fa-euro-sign euro"></i></div>
           <div>ILS : ${coin.ils} <i class="fas fa-shekel-sign shekel"></i></div>`);
  }
  // On click moreinfo button saving the more info values in map=======================
  function onMoreinfoClicked(coinId) {
    $(`#infoBtn${coinId}`).on("click", function () {
      $(".card-loader-animation").show();
      if (coinsMap.has(coinId)) {
        let backUpCoin = coinsMap.get(coinId);
        addCoinMoreInfoToUI(coinId, backUpCoin);
      } else {
        requestFromAjax(coinId);
      }
    });
  }
  // Remove moreinfo value after 2min and get the new values==========================================
  function removeMoreInfo(coinId, coinObj, coin) {
    coinsMap.set(coinId, coinObj);
    setTimeout(() => coinsMap.delete(coin.id), 120000);
  }

  // Live report===============================
  function showLiveReport() {
    if (selectedCoinArr.length == 0) {
      $("#chartContainer").hide();
      $(".col-sm-4").show();
      $(".search-div").show();
      $("#clear-selected").show();
      $(".selectedCoinUI").show();
      $(".footer").show();
      Swal.fire({
        title: "Pay attention!",
        text: "Live report cannot be empty, you have to mark up to 5 coins order to display live report on the graph.",
        icon: "error",
        confirmButtonText: "Cool",
      });
    } else {
      $(".card-loader-animation").show();

      let selectedCoinOnGraph1 = [];
      let selectedCoinOnGraph2 = [];
      let selectedCoinOnGraph3 = [];
      let selectedCoinOnGraph4 = [];
      let selectedCoinOnGraph5 = [];
      let coinsKeysArr = [];

      IntervalId = setInterval(() => {
        getData();
      }, 2000);

      function getData() {
        let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoinArr[0]},${selectedCoinArr[1]},${selectedCoinArr[2]},${selectedCoinArr[3]},${selectedCoinArr[4]}&tsyms=USD`;
        $.get(url).then((coin_value) => {
          $(".card-loader-animation").hide();

          let dateNow = new Date();
          let counter = 1;
          coinsKeysArr = [];

          for (let key in coin_value) {
            if (counter == 1) {
              selectedCoinOnGraph1.push({ x: dateNow, y: coin_value[key].USD });
              coinsKeysArr.push(key);
            }

            if (counter == 2) {
              selectedCoinOnGraph2.push({ x: dateNow, y: coin_value[key].USD });
              coinsKeysArr.push(key);
            }

            if (counter == 3) {
              selectedCoinOnGraph3.push({ x: dateNow, y: coin_value[key].USD });
              coinsKeysArr.push(key);
            }

            if (counter == 4) {
              selectedCoinOnGraph4.push({ x: dateNow, y: coin_value[key].USD });
              coinsKeysArr.push(key);
            }

            if (counter == 5) {
              selectedCoinOnGraph5.push({ x: dateNow, y: coin_value[key].USD });
              coinsKeysArr.push(key);
            }
            counter++;
          }
          createGraph();
          $(".card-loader-animation").hide();
        });
      }

      // Creating graph  from libary of canvasJS=======================
      function createGraph() {
        let chart = new CanvasJS.Chart("chartContainer", {
          animationEnabled: false,
          zoomEnabled: true,
          exportEnabled: true,
          backgroundColor: "#00142ae7",
          title: {
            text: "Real-time Price Of CryptoCurrencies",
            fontFamily: "Poppins",
            fontColor: "white",
          },

          axisX: {
            valueFormatString: "HH:mm:ss",
            labelFontColor: "red",
          },
          axisY: {
            title: "Currencies Value",
            suffix: "$",
            titleFontColor: "red",
            lineColor: "white",
            gridColor: "white",
            labelFontColor: "white",
            tickColor: "white",
            includeZero: false,
          },
          toolTip: {
            shared: true,
          },
          legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
          },
          data: [
            {
              type: "spline",
              name: coinsKeysArr[0],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: selectedCoinOnGraph1,
            },
            {
              type: "spline",
              name: coinsKeysArr[1],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: selectedCoinOnGraph2,
            },
            {
              type: "spline",
              name: coinsKeysArr[2],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: selectedCoinOnGraph3,
            },
            {
              type: "spline",
              name: coinsKeysArr[3],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: selectedCoinOnGraph4,
            },
            {
              type: "spline",
              name: coinsKeysArr[4],
              showInLegend: true,
              xValueFormatString: "HH:mm:ss",
              dataPoints: selectedCoinOnGraph5,
            },
          ],
        });

        chart.render();

        function toggleDataSeries(e) {
          if (
            typeof e.dataSeries.visible === "undefined" ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      }
    }
  }

  // Clicking by arrow button let you go to the top of the page===========
  window.onscroll = function () {
    validationScroller();
  };

  function validationScroller() {
    if (
      document.body.scrolltop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      $("#scroll-up-btn").css({ display: "block" });
    } else {
      $("#scroll-up-btn").css({ display: "none" });
    }
  }
})();
function ScrollPageToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
