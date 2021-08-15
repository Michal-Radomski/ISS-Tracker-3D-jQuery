// Function accordion()
// Open all parts of accordion
function accordion() {
  $("#buttonShow").click(function () {
    $(".infoContent").show(600);
    $(".collapsible").addClass("infoActive");
  });
  // Close all parts of accordion
  $("#buttonHide").click(function () {
    $(".infoContent").hide(300);
    $(".collapsible").removeClass("infoActive");
  });
  // Open/ Hide siblings of current .collapsible
  $(".collapsible").click(function () {
    if ($(this).next().is(":hidden")) {
      $(this).next().show(600).siblings(".infoContent").hide(300);
    } else {
      $(this).next().hide(300);
    }
  });
  // Change class for siblings of current .collapsible
  $(document).ready(function () {
    $(".collapsible").click(function () {
      if ($(this).hasClass("infoActive")) {
        $(this).removeClass("infoActive");
      } else {
        $(this).addClass("infoActive").siblings(this).removeClass("infoActive");
      }
    });
  });
}
accordion();
// Scripts for Curtain Info
function infoChange() {
  let curtainHeight = document.getElementById("myInfo").clientHeight; //Using clientHeight to get the actual height, ignoring style rules style.height.
  if (curtainHeight == "0") {
    document.getElementById("myInfo").style.height = "100%";
  } else {
    document.getElementById("myInfo").style.height = "0";
  }
}
function playHorse() {
  let horseAudio = document.getElementById("horseAudio");
  horseAudio.volume = 0.45;
  horseAudio.play();
}
// Scripts for closing the Info Curtain
function infoClose() {
  setTimeout(function () {
    document.getElementById("myInfo").style.height = "0%";
  }, 7000);
}
function closePlay() {
  let moveIt = document.getElementById("moveIt");
  moveIt.volume = 0.8;
  moveIt.play();
}
// Function that shakes the image
function shakeButton() {
  $("#btnClose").addClass("active");
  $("#infoClose").addClass("hide");
  $("#infoClose2").removeClass("hide");
  $("#btnClose").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
    $("#btnClose").removeClass("active");
    $("#infoClose").removeClass("hide");
    $("#infoClose2").addClass("hide");
  });
}
// Function for shaking the bigButton
$(document).ready(function () {
  $(".bigButton").click(function () {
    $(".bigButton").effect("shake", {times: 5}, 1100);
  });
});
// Functions for manipulating the progress bar
$(document).ready(function () {
  $("#btnClose").click(function () {
    $("#progressDiv").show(800);
    $("p#title").show(1500);
    $("p#title").delay(4000).hide(1000);
  });
});
$(document).ready(function () {
  $(".bigButton").click(function () {
    $("#progressDiv").hide();
  });
});
// Countdown timer
function countdownTimer() {
  let timeRemaining = 140;
  let countdownTimer = setInterval(function () {
    timeRemaining--;
    document.getElementById("progressBar").value = 140 - timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(countdownTimer);
    }
    document.getElementById("counting").innerHTML = `Time remaining: ${(timeRemaining / 20).toFixed(2)} seconds`;
  }, 50);
}
// Tooltips - Credits and Curtain2
$("#creditsButton, #buttonCurtain2, #LoadData, #trISS_passes>th").tooltip({
  hide: {
    effect: "explode",
    delay: 250,
  },
});
// Dialog (Modal) /taken from the home page of jQuery UI/
$(function () {
  $("#dialog").dialog({
    buttons: {
      Ok: function () {
        $(this).dialog("close");
      },
    },
    autoOpen: false,
    modal: true,
    width: "auto",
    height: "auto",
    closeOnEscape: true,
    show: {
      effect: "blind",
      duration: 1000,
    },
    hide: {
      effect: "explode",
      duration: 1000,
    },
    position: {my: "center", at: "center"},
  });
  $("#creditsButton").on("click", function () {
    $("#dialog").dialog("open");
  });
});
// Functions to open and close the Curtain 2
// Adding the sound
function doorCreakPlay() {
  let doorCreak = document.getElementById("doorCreak");
  doorCreak.volume = 0.8;
  doorCreak.play();
}
function openCurtain2() {
  doorCreakPlay();
  document.getElementById("curtain2").style.width = "100%";
}
function closeCurtain2() {
  doorCreakPlay();
  document.getElementById("curtain2").style.width = "0%";
}
