export const getHome = (req, res) => {
    console.log(req.session);
    if (req.session) {
        console.log(req.session.id);
        req.session.visited = true;
        res.cookie('name', 'express', { maxAge: 60000 * 60, signed: true });
    }
    res.status(200).json({
        success: true,
        message: 'API is running successfully',
        data: {
            session: req.session ? 'Active' : 'Not active'
        }
    });
}; 