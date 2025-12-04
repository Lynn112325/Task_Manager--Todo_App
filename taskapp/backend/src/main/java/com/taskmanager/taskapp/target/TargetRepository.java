package com.taskmanager.taskapp.target;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TargetRepository extends JpaRepository<Target, Long> {

    List<Target> findByUser_Id(Long userId);

    // check if the target belongs to the user before calling the following methods

}