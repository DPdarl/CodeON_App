// // app/routes/multiplayer.$gameId.tsx
// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "@remix-run/react";
// import { useAuth } from "~/contexts/AuthContext";
// import { PrivateRoute } from "~/components/PrivateRoute";
// import { Button } from "~/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
// import { Progress } from "~/components/ui/progress";
// import { Users, Clock, Trophy, X } from "lucide-react";

// // Mock questions data - replace with your actual questions
// const QUESTIONS = [
//   {
//     id: 1,
//     question: "What keyword is used to define a class in C#?",
//     options: ["class", "struct", "interface", "define"],
//     correctAnswer: 0,
//     timeLimit: 20
//   },
//   {
//     id: 2,
//     question: "Which of these is a value type in C#?",
//     options: ["string", "class", "int", "array"],
//     correctAnswer: 2,
//     timeLimit: 15
//   },
//   {
//     id: 3,
//     question: "What is the default access modifier for class members in C#?",
//     options: ["public", "private", "protected", "internal"],
//     correctAnswer: 1,
//     timeLimit: 20
//   }
// ];

// export default function MultiplayerGame() {
//   const { gameId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [gameState, setGameState] = useState("waiting"); // waiting, playing, finished
//   const [players, setPlayers] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [scores, setScores] = useState({});

//   // Simulate joining a game
//   useEffect(() => {
//     // In a real app, you would connect to your backend here
//     const mockPlayers = [
//       { id: user.uid, name: user.displayName, score: 0 },
//       { id: "player2", name: "CodeMaster", score: 0 },
//       { id: "player3", name: "DotNetExpert", score: 0 }
//     ];

//     setPlayers(mockPlayers);
//     setScores(Object.fromEntries(mockPlayers.map(p => [p.id, 0])));

//     // Simulate game starting after 5 seconds
//     const timer = setTimeout(() => {
//       setGameState("playing");
//       startQuestion(0);
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [gameId, user]);

//   const startQuestion = (questionIndex) => {
//     setCurrentQuestion(questionIndex);
//     setSelectedAnswer(null);
//     setTimeLeft(QUESTIONS[questionIndex].timeLimit);

//     const timer = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           handleTimeUp();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const handleAnswerSelect = (answerIndex) => {
//     if (selectedAnswer !== null) return; // Prevent double answers

//     setSelectedAnswer(answerIndex);

//     // Check if answer is correct
//     const isCorrect = answerIndex === QUESTIONS[currentQuestion].correctAnswer;

//     if (isCorrect) {
//       // Update score
//       const newScores = { ...scores };
//       newScores[user.uid] = (newScores[user.uid] || 0) + 100;
//       setScores(newScores);

//       // Update players list with new scores
//       setPlayers(prev => prev.map(p =>
//         p.id === user.uid ? { ...p, score: newScores[user.uid] } : p
//       ));
//     }

//     // Move to next question after a delay
//     setTimeout(() => {
//       if (currentQuestion < QUESTIONS.length - 1) {
//         startQuestion(currentQuestion + 1);
//       } else {
//         endGame();
//       }
//     }, 2000);
//   };

//   const handleTimeUp = () => {
//     if (selectedAnswer === null) {
//       // Player didn't answer in time
//       setSelectedAnswer(-1); // Mark as no answer

//       // Move to next question after a delay
//       setTimeout(() => {
//         if (currentQuestion < QUESTIONS.length - 1) {
//           startQuestion(currentQuestion + 1);
//         } else {
//           endGame();
//         }
//       }, 2000);
//     }
//   };

//   const endGame = () => {
//     setGameState("finished");
//   };

//   const leaveGame = () => {
//     navigate("/dashboard");
//   };

//   if (gameState === "waiting") {
//     return (
//       <PrivateRoute>
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
//           <Card className="w-full max-w-md mx-4">
//             <CardHeader>
//               <CardTitle className="text-center">Waiting for Players</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="text-center">
//                 <p className="text-lg font-semibold">Game Code: {gameId}</p>
//                 <p className="text-muted-foreground">Share this code with friends to join</p>
//               </div>

//               <div className="space-y-3">
//                 <h3 className="font-medium">Players ({players.length})</h3>
//                 {players.map(player => (
//                   <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
//                     <span>{player.name}</span>
//                     {player.id === user.uid && <span className="text-sm text-muted-foreground">You</span>}
//                   </div>
//                 ))}
//               </div>

//               <Button className="w-full" variant="outline" onClick={leaveGame}>
//                 <X className="mr-2 h-4 w-4" />
//                 Leave Game
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </PrivateRoute>
//     );
//   }

//   if (gameState === "playing") {
//     const question = QUESTIONS[currentQuestion];

//     return (
//       <PrivateRoute>
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
//           <div className="max-w-4xl mx-auto">
//             {/* Header with game info */}
//             <div className="flex justify-between items-center mb-8">
//               <div className="flex items-center space-x-2">
//                 <Users className="h-5 w-5" />
//                 <span>{players.length} Players</span>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Clock className="h-5 w-5" />
//                 <span className="font-mono">{timeLeft}s</span>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Trophy className="h-5 w-5" />
//                 <span>Question {currentQuestion + 1}/{QUESTIONS.length}</span>
//               </div>
//             </div>

//             {/* Question */}
//             <Card className="mb-8">
//               <CardHeader>
//                 <CardTitle className="text-center text-2xl">
//                   {question.question}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {question.options.map((option, index) => {
//                   let buttonVariant = "outline";
//                   if (selectedAnswer !== null) {
//                     if (index === selectedAnswer) {
//                       buttonVariant = index === question.correctAnswer ? "default" : "destructive";
//                     } else if (index === question.correctAnswer) {
//                       buttonVariant = "default";
//                     }
//                   }

//                   return (
//                     <Button
//                       key={index}
//                       variant={buttonVariant}
//                       className="h-16 text-lg justify-start"
//                       disabled={selectedAnswer !== null}
//                       onClick={() => handleAnswerSelect(index)}
//                     >
//                       {option}
//                     </Button>
//                   );
//                 })}
//               </CardContent>
//             </Card>

//             {/* Scoreboard */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Scoreboard</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {players
//                   .sort((a, b) => b.score - a.score)
//                   .map((player, index) => (
//                     <div key={player.id} className={`flex items-center justify-between p-3 border rounded-lg ${
//                       player.id === user.uid ? "bg-primary/10 border-primary" : ""
//                     }`}>
//                       <div className="flex items-center space-x-3">
//                         <span className="font-medium w-6 text-center">{index + 1}</span>
//                         <span>{player.name}</span>
//                         {player.id === user.uid && <span className="text-sm text-muted-foreground">You</span>}
//                       </div>
//                       <span className="font-bold">{player.score}</span>
//                     </div>
//                   ))
//                 }
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </PrivateRoute>
//     );
//   }

//   if (gameState === "finished") {
//     const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
//     const userRank = sortedPlayers.findIndex(p => p.id === user.uid) + 1;

//     return (
//       <PrivateRoute>
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle className="text-center">Game Finished!</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="text-center">
//                 <p className="text-2xl font-bold">You placed #{userRank}</p>
//                 <p className="text-muted-foreground">with {scores[user.uid]} points</p>
//               </div>

//               <div className="space-y-3">
//                 <h3 className="font-medium">Final Results</h3>
//                 {sortedPlayers.map((player, index) => (
//                   <div key={player.id} className={`flex items-center justify-between p-3 border rounded-lg ${
//                     player.id === user.uid ? "bg-primary/10 border-primary" : ""
//                   }`}>
//                     <div className="flex items-center space-x-3">
//                       <span className="font-medium w-6 text-center">{index + 1}</span>
//                       <span>{player.name}</span>
//                       {player.id === user.uid && <span className="text-sm text-muted-foreground">You</span>}
//                     </div>
//                     <span className="font-bold">{player.score}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex space-x-4">
//                 <Button className="flex-1" variant="outline" onClick={leaveGame}>
//                   Back to Dashboard
//                 </Button>
//                 <Button className="flex-1">
//                   Play Again
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </PrivateRoute>
//     );
//   }

//   return null;
// }
