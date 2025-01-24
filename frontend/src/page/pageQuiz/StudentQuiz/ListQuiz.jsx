import React from 'react'
import SQuizList from '../../../components/Quiz/Student/QuizList';
const ListQuiz = () => {
  return (
    <div className="mb-2" style={{marginTop: "100px"}}>
        <div className="container">
          <div className="font-semibold text-2xl pb-2 mt-8 lg:mx-20">
            <h1 className="text-center text-4xl border-b-2 border-purple-600 pb-2">
                แบบทดสอบ
            </h1>
          </div>
          <SQuizList/>

        </div>

      </div>
    
      
      
    
  )
}

export default ListQuiz
