function calc(dt) {
    if (tmp.pass > 0) tmp.pass--
    else {
        for (let [i,v] of Object.entries(CURRENCIES)) {
            var passive = v.passive ?? 1
            gainCurrency(i, tmp.currency_gain[i].mul(dt*passive))
        }
    
        let p = PROGRESS[player.feature]
    
        if (p && p.auto && p.amount.gte(p.require)) player.feature++
    
        for (let [i,v] of Object.entries(AUTOMATION)) {
            let a = player.auto[i], [I,D] = v.interval
            if (a[1] && v.unl()) {
                let s = Math.max(AUTO_MIN_INTERVAL,I*D**a[0])
                let t = auto_time[i] + dt
                if (t >= s) {
                    t %= s
                    v.trigger()
                }
                auto_time[i] = t
            }
            else auto_time[i] = 0
        }
    
        if (player.feature >= 4) {
            let u = player.explore.unl
            if (EXPLORE[u] && player.shark_level.gte(EXPLORE[u].level_req)) player.explore.unl++
    
            if (player.explore.active > -1) player.explore.best_fish = player.explore.best_fish.max(player.fish)
    
            var auto_e = player.research.e3.toNumber() + (hasResearch('e5') ? 1 : 0)
    
            for (let i in EXPLORE) {
                i = parseInt(i)
                if (u > i) {
                    var c = calcNextDepth(player.explore.depth[i], tmp.depth_gain[i].mul(dt))
                    if (i >= 4 || !hasEvolutionTree(i+8)) c = c.min(EXPLORE[i].maxDepth)
                    player.explore.depth[i] = c
                }
                if (auto_e > i) player.explore.base[i] = player.explore.base[i].max(getBaseExploration(i,player.fish))
            }
        }
    
        if (player.feature >= 7) {
            var rad = player.core.radiation
            var goal = hasEvolutionGoal(6)
    
            if (goal || rad.amount.lt(tmp.cr_limit)) {
                let g = rad.amount.add(tmp.cr_gain.mul(dt))
                if (!goal) g = g.min(tmp.cr_limit)
                rad.amount = g
            }
        }
    
        if (player.feature >= 12) {
            for (let i = 0; i < EVOLUTION_GOAL.length; i++) if (!hasEvolutionGoal(i)) {
                var g = EVOLUTION_GOAL[i]
                if (!g.locked() && g.goal()) player.humanoid.goal.push(i)
            }

            if (!hasEvolutionGoal(3) && hasEvolutionGoal(4)) player.humanoid.goal.push(3)
        }
    
        player.shark_rank = player.shark_rank.max(SHARK.rank.bulk)
    }

    player.latest_time = Date.now()
}