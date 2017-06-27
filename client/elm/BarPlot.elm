module BarPlot exposing (..)

import Svg exposing (..)
import Svg.Attributes exposing (..)

type alias BarPlot = {
        minValue : Float,
        maxValue : Float,
        value : Float
    }

barPlot : BarPlot -> List (String, Float, Float) -> Svg msg
barPlot ({ value, minValue, maxValue } as params) annotations =
    let
        wVal = lerp value minValue maxValue 0 100
    in
        g []
            (List.append
            [ rect [ x "0", y "0", width "100", height "10", fill "#CE292B" ] [],
              rect [ x "0", y "0", height "10", toString wVal |> width, fill "#0B40CE" ] [],
              text_ [ x (toString (wVal+5)), y "5", alignmentBaseline "central", Svg.Attributes.style "font-size: 8px", pointerEvents "none"] [Svg.text ("$" ++ (toString (round value)))]
            ]
            (List.map ((scaleAnnotation params) >> drawAnnotation) annotations))

scaleAnnotation : BarPlot -> (String, Float, Float) -> (String, Float, Float)
scaleAnnotation params (name, min, max) =
    ( name,
      lerp min params.minValue params.maxValue 0 100,
      lerp max params.minValue params.maxValue 0 100
    )
            
drawAnnotation : (String, Float, Float) -> Svg a
drawAnnotation (name, min, max) =
    let
        midpoint = ((min + max)/2)
    in
        g [ transform "translate(0,10.5)" ]
            [
             bracket min max,
                 line [ x1 (toString midpoint), y1 "2", x2 (toString midpoint), y2 "3",
                        stroke "#000000", strokeWidth "0.5", fill "none"] [],
                 text_ [ x (toString midpoint), y "3.5", textAnchor "middle",
                         alignmentBaseline "hanging", Svg.Attributes.style "font-size: 2px", pointerEvents "none"]
                     [Svg.text name]
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


                  
