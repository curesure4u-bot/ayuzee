import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const learningRoutes = (
  <>
    <Route path="/learning" element={withSuspense(<P.LearningLayout />)}>
      <Route index element={withSuspense(<P.Courses />)} />
      <Route path="courses" element={withSuspense(<P.Courses />)} />
      <Route path="webinars" element={withSuspense(<P.Webinars />)} />
      <Route path="quiz" element={withSuspense(<P.Quizzes />)} />
      <Route path="blogs" element={withSuspense(<P.Blogs />)} />
      <Route path="library" element={withSuspense(<P.Library />)} />
    </Route>
    <Route path="/learning/courses/:slug" element={withSuspense(<P.CourseDetail />)} />
    <Route path="/learning/courses/:slug/quiz" element={withSuspense(<P.CourseQuiz />)} />
    <Route path="/learning/blogs/:slug" element={withSuspense(<P.BlogDetail />)} />
    <Route path="/learning/certificates/:id" element={withSuspense(<P.Certificate />)} />
  </>
);
