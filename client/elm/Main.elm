module Main exposing (main)

import Bootstrap.Navbar as Navbar
import Data.Session exposing (Session)
import Html exposing (Html, div)
import Http exposing (send)
import Navigation exposing (Location)
import Page.Budget as Budget
import Page.Profile as Profile
import Page.Errored as Errored exposing (PageLoadError, pageLoadError)
import Page.Home as Home
import Page.Login as Login
import Page.Expense as Expense
import Page.ExpenseDetail as ExpenseDetail
import Request.Session
import Route exposing (Route)
import Task
import Util exposing ((=>))
import View.Page as Page exposing (ActivePage)


type Page
    = Blank
    | NotFound
    | Errored PageLoadError
    | Home Home.Model
    | Login Login.Model
    | Budget Budget.Model
    | Profile Profile.Model
    | Expense Expense.Model
    | ExpenseDetail ExpenseDetail.Model

type PageState
    = Loaded Page
    | TransitioningFrom Page

type StartupModel
    = HaveSession Model
    | WaitingForSession Location
      
type alias Model =
    { session : Session
    , pageState : PageState
    , navState : Navbar.State
    }

startupInit : Location -> (StartupModel, Cmd Msg)
startupInit location =
    (WaitingForSession location, Http.send SetSession Request.Session.getSession)
    
init : Location -> Session -> (Model, Cmd Msg)
init location session =
    let
        (navState, navCmd) = Navbar.initialState NavMsg
        (model, cmd) = setRoute (Route.fromLocation <| Debug.log "Starting Loc" location)
                       { pageState = Loaded Blank
                       , session = session
                       , navState = navState
                       }
    in
        model ! [cmd, navCmd]


getPage : PageState -> Page
getPage pageState =
    case pageState of
        Loaded page ->
            page

        TransitioningFrom page ->
            page
            
-- VIEW --

startupView : StartupModel -> Html Msg
startupView model =
    case model of
        WaitingForSession _ -> div [] []
        HaveSession model -> view model

view : Model -> Html Msg
view model =
    case model.pageState of
        Loaded page ->
            viewPage model False page
                
        TransitioningFrom page ->
            viewPage model True page

viewPage : Model -> Bool -> Page -> Html Msg
viewPage model isLoading page =
    let
        session = model.session
        frame =
            Page.frame NavMsg model.navState isLoading session
    in
        case page of
            Errored subModel ->
                Errored.view session subModel
                    |> frame Page.Other
                       
            Home subModel ->
                Home.view session subModel |> frame Page.Home

            Budget subModel ->
                Budget.view session subModel
                    |> Html.map BudgetMsg
                    |> frame Page.Budget
                                               
            Login subModel ->
                Login.view subModel
                    |> Html.map LoginMsg
                    |> frame Page.Budget

            Profile subModel ->
                Profile.view session subModel
                    |> Html.map ProfileMsg
                    |> frame Page.Profile

            Expense subModel ->
                Expense.view subModel
                    |> Html.map ExpenseMsg
                    |> frame Page.Expense

            ExpenseDetail subModel ->
                ExpenseDetail.view subModel
                    |> Html.map ExpenseDetailMsg
                    |> frame Page.Other

            NotFound ->
                Html.text "Page Not Found" |> frame Page.Other

            Blank -> Html.text "" |> frame Page.Other
                       
--            _ -> Html.text "Unsupported View" |> frame Page.Other


subscriptions : StartupModel -> Sub Msg
subscriptions startModel =
    case startModel of
        WaitingForSession _ -> Sub.none
        HaveSession model ->
            Sub.batch
                [case model.pageState of
                     Loaded (Budget subModel) ->
                         Budget.subscriptions subModel |> Sub.map BudgetMsg
             
                     _ -> Sub.none
                , Navbar.subscriptions model.navState NavMsg
                ]
    
-- UPDATE --

type Msg
    = SetSession (Result Http.Error Session)
    | SetRoute (Maybe Route)
    | BudgetLoaded (Result PageLoadError Budget.Model)
    | ExpenseLoaded (Result PageLoadError Expense.Model)
    | ExpenseDetailLoaded (Result PageLoadError ExpenseDetail.Model)
    | NavMsg Navbar.State
    | BudgetMsg Budget.Msg
    | LoginMsg Login.Msg
    | ProfileMsg Profile.Msg
    | ExpenseMsg Expense.Msg
    | ExpenseDetailMsg ExpenseDetail.Msg



setRoute : Maybe Route -> Model -> (Model, Cmd Msg)
setRoute maybeRoute model =
    let
        transition toMsg task =
            { model | pageState = TransitioningFrom (getPage model.pageState) }
                => Task.attempt toMsg task

        errored =
            pageErrored model

        loggedIn = model.session.user /= Nothing

    in
        case maybeRoute of
            Nothing -> { model | pageState = Loaded NotFound } => Cmd.none
            Just Route.Home ->
                { model | pageState = Loaded (Home Home.initialModel) } => Cmd.none
            Just Route.Budget ->
                if loggedIn then
                    transition BudgetLoaded Budget.init
                else
                    (model, Route.modifyUrl Route.Login)
            Just Route.Expense ->
                if loggedIn then
                    transition ExpenseLoaded Expense.init
                else
                    (model, Route.modifyUrl Route.Login)
            Just Route.Login ->
                if loggedIn then
                    (model, Route.modifyUrl Route.Home)
                else
                    { model | pageState = Loaded (Login Login.initialModel) } => Cmd.none
            Just Route.Profile ->
                if loggedIn then
                    { model | pageState = Loaded (Profile Profile.init) } => Cmd.none
                else
                    (model, Route.modifyUrl Route.Login)

            Just (Route.ExpenseDetail slug) ->
                if loggedIn then
                    transition ExpenseDetailLoaded (ExpenseDetail.init slug)
                else
                    (model, Route.modifyUrl Route.Login)        

pageErrored : Model -> ActivePage -> String -> ( Model, Cmd msg )
pageErrored model activePage errorMessage =
    let
        error = Errored.pageLoadError activePage errorMessage
    in
        { model | pageState = Loaded (Errored error) } => Cmd.none

startupUpdate : Msg -> StartupModel -> (StartupModel, Cmd Msg)
startupUpdate msg startModel =
    case startModel of
        WaitingForSession location ->
            case msg of
                SetSession (Ok session) ->
                    let
                        (model, cmd) = init location session
                    in
                        (HaveSession model, cmd)
                msg -> Debug.crash "Got a non-session message during startup" msg
        HaveSession model ->
            let
                (newModel, cmd) = update msg model
            in
                (HaveSession newModel, cmd)
            
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    let
        x = Debug.log "Msg" msg
    in
        updatePage (getPage model.pageState) msg model

        
updatePage : Page -> Msg -> Model -> ( Model, Cmd Msg )
updatePage page msg model =
    let
        session =
            model.session

        setSession newModel cmd newSession =
            let
                sessionCmd = if model.session.authToken /= Nothing then
                                 Route.modifyUrl Route.Home
                             else
                                 Cmd.none
            in
                { newModel | session = newSession } ! [cmd, sessionCmd]

                
        toPage toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newCmd ) = subUpdate subMsg subModel
            in
                ( { model | pageState = Loaded (toModel newModel) }, Cmd.map toMsg newCmd )

        toPageWithOut toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newCmd, outMsg ) = subUpdate subMsg subModel
            in
                ( { model | pageState = Loaded (toModel newModel) }, Cmd.map toMsg newCmd, outMsg )                    
    in
        Debug.log "Result" <| case (msg, page) of
            (SetRoute route, _) ->
                setRoute route model
                    
            (SetSession (Ok session), _) ->
                setSession model Cmd.none session
                    
            (SetSession (Err err), _) ->
                Tuple.first (pageErrored model Page.Home "Failed to get session state from server", Debug.log "Load Error: " err)
                              
            (BudgetLoaded (Ok subModel), _) ->
                { model | pageState = Loaded (Budget subModel) } => Cmd.none
                    
            (BudgetLoaded (Err error), _) ->
                { model | pageState = Loaded (Errored error) } => Cmd.none

            (ExpenseLoaded (Ok subModel), _) ->
                { model | pageState = Loaded (Expense subModel) } => Cmd.none
                    
            (ExpenseLoaded (Err error), _) ->
                { model | pageState = Loaded (Errored error) } => Cmd.none
                    
            (ExpenseDetailLoaded (Ok subModel), _) ->
                { model | pageState = Loaded (ExpenseDetail subModel) } => Cmd.none

            (ExpenseDetailLoaded (Err error), _) ->
                { model | pageState = Loaded (Errored error) } => Cmd.none

            (NavMsg navState, _) ->
                { model | navState = navState } => Cmd.none

            (BudgetMsg subMsg, Budget subModel) ->
                toPage Budget BudgetMsg (Budget.update session) subMsg subModel

            (LoginMsg subMsg, Login subModel) ->
                let
                    (newModel, cmd, outMsg) = toPageWithOut Login LoginMsg Login.update subMsg subModel
                in
                    case outMsg of
                        Just (Login.SetSession newSession) ->
                            setSession newModel cmd newSession

                        Nothing -> (newModel, cmd)

            (ProfileMsg subMsg, Profile subModel) ->
                let
                    (newModel, cmd, outMsg) = toPageWithOut Profile ProfileMsg (Profile.update session) subMsg subModel
                in
                    case outMsg of
                        Just (Profile.SetSession newSession) ->
                            setSession newModel cmd newSession

                        Nothing -> (newModel, cmd)
            (ExpenseDetailMsg subMsg, ExpenseDetail subModel) ->
                    toPage ExpenseDetail ExpenseDetailMsg (ExpenseDetail.update session) subMsg subModel
                        
            --(_, NotFound) ->
            --  model => Cmd.none
                    
            (_, _) ->
                model => Cmd.none

-- MAIN --


main : Program Never StartupModel Msg
main =
    Navigation.program (Route.fromLocation >> SetRoute)
        { init = startupInit
        , view = startupView
        , update = startupUpdate
        , subscriptions = subscriptions
        }
