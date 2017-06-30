module Animation exposing (..)

import Ease exposing (..)
import Time exposing (..)

slide : (Float -> model -> model) -> Time -> Time -> model -> model
slide updater startTime nowTime =
    let
        currentValue : Time -> Float
        currentValue = easeMove 0 1 Time.second startTime
    in
        updater (currentValue nowTime)

lerp : Float -> Float -> Float -> Float
lerp x0 x1 u =
    u * x1 + (1 - u) * x0

easeMove : Float -> Float -> Time -> Time -> Time -> Float
easeMove startPos stopPos duration startTime curTime =
    let
        v = clamp 0 1 ((curTime - startTime)/duration)
    in
        lerp startPos stopPos (outQuint v)
