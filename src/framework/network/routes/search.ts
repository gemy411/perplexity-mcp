import { Request, Response, Router } from 'express';
import { getSearchUseCase } from '../../di/factory.js';
import { SearchOnlineParams } from '../../../usecase/search/models/search-online-params.js';
import { none } from 'fp-ts/lib/Option.js';

const router = Router();
const useCase = getSearchUseCase();

router.get('/search', async (req: Request, res: Response) => {
  const query = req.query.search_query as string;
  if (!query) {
    res.status(400).json({ error: 'search_query is required' });
    return;
  }

  const depthParam = req.query.depth as string;
  const allowedDepths = ["shallow", "medium", "deep"];
  if (depthParam && !allowedDepths.includes(depthParam)) {
    res.status(400).json({ error: `Invalid depth parameter. Allowed values are: ${allowedDepths.join(", ")}` });
    return;
  }

  const depth = (depthParam || "medium") as "shallow" | "medium" | "deep";

  try {
    const searchParams = new SearchOnlineParams(query, none, depth, "normal");
    const result = await useCase.execute(searchParams);
    res.status(200).json({
      query,
      result
    });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

export default router;
