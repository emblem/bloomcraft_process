module View.PieChart exposing (pieChart)

import Svg exposing (..)
import Svg.Attributes exposing (..)
import Svg.Path exposing (..)

import Util exposing (rotateList)
import View.Colors as Colors exposing (ColorWheel)

pieChart : List (Int, String) -> Svg a
pieChart data =
    let
        radius = 50

        wedgePath : Float -> Float -> Subpath
        wedgePath startAngle endAngle =
            let
                arcType = if endAngle - startAngle > pi then
                              largestArc
                          else
                              smallestArc
            in                    
                subpath (startAt (0, 0)) closed
                    [ lineTo (radius * (cos startAngle), radius * (-(sin startAngle)))
                    , arcTo (radius, radius) 0 (arcType, antiClockwise)
                        (radius * (cos endAngle), radius * (-(sin endAngle)))
                    ]

        totalAmount = data |> List.map Tuple.first |> List.sum |> toFloat
        
        wedge :(Int, String)
              -> {startAngle:Float, colorWheel:ColorWheel, elements:(List (Svg a), List (Svg a))}
              -> {startAngle:Float, colorWheel:ColorWheel, elements:(List (Svg a), List (Svg a))}
        wedge (amount, label) ({startAngle, colorWheel, elements} as initialState)  =
            let
                endAngle = startAngle + 2 *pi * (toFloat amount)/totalAmount
                midAngle = (startAngle + endAngle)/2
                textRotation = "rotate(" ++ toString (-360/(2*pi)*midAngle) ++ ")"
                flipText = midAngle > pi/2 && midAngle < 3*pi/2
                anchor = if flipText then
                             "end"
                         else
                             "start"

                textFlip = if flipText then
                               "scale(-1,-1)"
                           else
                               ""

                textTranslate = " translate (" ++ toString (20) ++ ",0) "
                           
                (texts, paths) = elements
            in
                if amount /= 0 then
                    { startAngle = endAngle
                    , colorWheel = rotateList colorWheel
                    , elements =
                          ( g [ transform <| textRotation ++ textTranslate ++ textFlip]
                                [ Svg.text_
                                      [ x "0"
                                      , y "0"
                                      , fontSize "5px"
                                      , alignmentBaseline "middle"
                                      , textAnchor anchor
                                      ] [Svg.text label]
                                ] :: texts
                          , Svg.path
                              [ d <| pathToString [wedgePath startAngle endAngle]
                              , fill (Colors.nextColor colorWheel)
                              , stroke "#FFFFFF"
                              , strokeLinejoin "round"
                              ] [] :: paths
                          )
                    }
                else
                    initialState

        pieStart = { startAngle = 0
                   , colorWheel = Colors.defaultColorWheel
                   , elements = ([],[])                                     
                   }

        (texts, paths) = data |> List.foldr wedge pieStart |> .elements
    in        

        paths ++ texts |> g [ transform "translate(50,50)"]
