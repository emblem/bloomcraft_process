module BarPlot exposing (..)

import Svg exposing (..)
import Svg.Attributes exposing (..)

type alias BarPlot = {
        minValue : Float,
        maxValue : Float,
        value : Float
    }

barPlot : BarPlot -> Svg msg
barPlot { value, minValue, maxValue } =
    let
        wVal = lerp value minValue maxValue 0 100
    in
        g []
            [ rect [ x "0", y "0", width "100", height "10", fill "#CE292B" ] [],
              rect [ x "0", y "0", height "10", toString wVal |> width, fill "#0B40CE" ] [],
              g [ transform "translate(0,10.5)" ] [bracket 0 wVal],
              text_ [ x (toString (wVal+5)), y "5", alignmentBaseline "central", Svg.Attributes.style "font-size: 8px", pointerEvents "none"] [Svg.text ("$" ++ (toString (round wVal)))]
            ]

bracket : Float -> Float -> Svg msg
bracket left right =
    polyline [ stroke "#000000", strokeWidth ".5", fill "none",
               points (polyPoints [(left, 0), (left, 2), (right, 2), (right, 0)])
             ] []

polyPoints : List (Float, Float) -> String
polyPoints points =
    points
    |> List.map (\(x, y) -> (toString x) ++ ", " ++ (toString y))
    |> String.join " "
                     

lerp : Float -> Float -> Float -> Float -> Float -> Float
lerp u d0 d1 r0 r1 =
    let
        ud = (u - d0)/(d1-d0)
    in
        r1 * ud + r0 * (1 - ud)


                  
