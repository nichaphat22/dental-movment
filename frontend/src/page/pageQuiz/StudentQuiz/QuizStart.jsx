import React from 'react'
// import Question from '../../../components/Quiz/Question'
import SQuizStart from '../../../components/Quiz/Student/QuizStart';
import { useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';


function QuizStart() {
  return (
    <div className="mb-2" >



      <SQuizStart/>


      
    </div>
  )
}

export default QuizStart