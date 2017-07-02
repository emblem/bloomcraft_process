module Request.Helpers exposing (..)

apiUrl : String -> String
apiUrl url = "http://localhost:8000/process/api" ++ url
