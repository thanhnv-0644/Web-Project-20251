package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    @Query("""
    SELECT MONTH(u.createdAt), COUNT(u)
    FROM User u
    GROUP BY MONTH(u.createdAt)
    ORDER BY MONTH(u.createdAt)
    """)
    List<Object[]> userGrowthByMonth();

}
