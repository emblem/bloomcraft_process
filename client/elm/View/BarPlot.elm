module View.BarPlot exposing (..)

import Svg exposing (..)
import Svg.Attributes exposing (..)

type alias BarPlot =
    { minValue : Float
    , maxValue : Float
    , height : Float
    , filled : Bool
    }

defaultPlotParams : BarPlot
defaultPlotParams =
    { minValue = 0
    , maxValue = 0
    , height = 10
    , filled = True
    }
        

    
drawBox : BarPlot -> (Float, Float, String) -> Svg msg
drawBox params (value0, value1, color) =
    let
        v0 = plotToVis params <| Basics.min value1 value0
        v1 = plotToVis params <| Basics.max value0 value1
        h = params.height |> toString
    in
        rect (List.append
                  [ v0 |>toString |> x
                  , y "0"
                  , v1 - v0 |> toString |> width
                  , params.height |> toString |> height
                  ] 
                  (case params.filled of
                    True -> [fill color, stroke "none"]
                    False -> [fill "none", stroke color]
                  )
             ) []

tupleMap2 : (a->b) -> (a, a) -> (b, b)
tupleMap2 f (a1, a2) =
    (f a1, f a2)
        
drawSeparator : BarPlot -> AnnotationLocation -> Float -> Svg msg
drawSeparator params textLoc location =
    let
        pos = toString <| plotToVis params location
        (y1s, y2s) = tupleMap2 toString <|
                     case textLoc of
                         Above -> (-3, params.height)
                         Below -> (0, params.height + 3)
                         Inside _ -> (0, params.height)
    in
        line [ x1 pos, y1 y1s, x2 pos, y2 y2s, strokeWidth ".5", fill "none", stroke "#000000" ] []

plotToVis : BarPlot -> Float -> Float
plotToVis params value =
    lerp value params.minValue params.maxValue 0 100

type Side = Left | Right
type AnnotationLocation = Above | Below | Inside Side
type AnnotationType = Bracket Float Float | Separator Float | TextOnly Float
type AnnotationOption = Text String | Location AnnotationLocation | Type AnnotationType | Size String

type alias AnnotationOptions =
    { location : AnnotationLocation
    , atype : AnnotationType
    , text : String
    , fontSize : String
    }
    
annotationOptionBuilder : AnnotationOption -> AnnotationOptions -> AnnotationOptions
annotationOptionBuilder option optionSet =
    case option of
        Text str -> { optionSet | text = str }
        Location loc -> { optionSet | location = loc }
        Type atype -> { optionSet | atype = atype }
        Size size -> {optionSet | fontSize = size }

defaultOptions : AnnotationOptions
defaultOptions =
    { location = Below
    , atype = TextOnly 0
    , text = ""
    , fontSize = "5px"
    }
            
annotate : BarPlot -> List AnnotationOption -> Svg a
annotate params optList =
    let
        options = List.foldr annotationOptionBuilder defaultOptions optList

        initTextCenter = plotToVis params <| case options.atype of
                                             Bracket min max -> (min + max)/2
                                             Separator pos -> pos
                                             TextOnly pos -> pos
        textCenter = toString <| case options.location of
                                     Inside Left -> initTextCenter - 1
                                     Inside Right -> initTextCenter + 1
                                     _ -> initTextCenter
                                         
        (yPos, textBaseline) = case options.location of
                                       Above -> (-4, "bottom")
                                       Below -> (params.height + 3.5, "hanging")
                                       Inside _ -> (params.height/2, "central")
        anchor = case options.location of
                     Inside Left -> "end"
                     Inside Right -> "start"
                     _ -> "middle"
    in
        g [ ] <|
            List.concat
                [ (case options.atype of
                       Bracket min max ->
                           [bracket params options.location min max]
                       Separator pos -> [drawSeparator params options.location pos]
                       TextOnly _ -> []
                  )
                , [ text_ [ x textCenter, y <| toString yPos, textAnchor anchor,
                            alignmentBaseline textBaseline,
                            Svg.Attributes.style ("font-size: " ++ options.fontSize), pointerEvents "none"
                          ] [Svg.text options.text]
                  ]
                ]

                
bracket : BarPlot -> AnnotationLocation -> Float -> Float -> Svg msg
bracket params location pleft pright =    
    let
        left = plotToVis params pleft
        right = plotToVis params pright
        midpoint = (left + right)/2                   
        position = case location of
                       Above -> "translate (0,-0.5) scale(1, -1)"
                       Below -> "translate (0, 10.5)"
                       Inside _ -> "translate (0, " ++ (params.height/2 |> toString) ++ ")"

    in
        g [ transform position ] [ polyline [ stroke "#000000", strokeWidth ".5", fill "none",
                     points (polyPoints [ (left, 0)
                                        , (Basics.min (left+1.5) midpoint, 1.5)
                                        , (Basics.max (right-1.5) midpoint, 1.5)
                                        , (right, 0)
                                        ])
                   ] []
        , line [ x1 <| toString midpoint
               , y1 "1.5"
               , x2 <| toString midpoint
               , y2 "2.5"
               , stroke "#000000"
               , strokeWidth "0.5"
               , fill "none"
               ] []
        ]

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


                  
