module View.Colors exposing (..)

blueColor : String
blueColor = "#0B40CE"

lightBlueColor : String
lightBlueColor = "#3B70FE"

redColor : String
redColor = "#CE292B"

lightRedColor : String
lightRedColor = "#EE494B"

type alias ColorWheel = List String

defaultColorWheel : ColorWheel
defaultColorWheel = ["#1D9382", "#3933A3", "#93D72B"]

nextColor : ColorWheel -> String
nextColor wheel =
    case wheel of
        [] -> "#FF0000"
        color :: _ -> color
